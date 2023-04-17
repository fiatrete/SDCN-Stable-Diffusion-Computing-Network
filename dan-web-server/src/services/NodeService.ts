import { Redis } from 'ioredis';
import redisConfig from '../config/redisConfig';
import { RedisService, NodeRepository, NodeTaskRepository } from '../repositories';
import logger from '../utils/logger';
import HonorService from './HonorService';
import { JobsOptions, Queue, Worker } from 'bullmq';
import _ from 'lodash';
import { json } from 'stream/consumers';

/*
The meaning of keys in redis

1. "Svr$" + ${sever} is used as a counter, storing its node ID, the ttl is used to keepalive a worker
2. "WorkQ" is used as a queue of workers, every time a task comming, the first worker in "WorkQ" will take the task
3. "WorkQSet" is written with "WorkQ" simultaneously, thus they contain same elements except order.
    "WorkQSet" is used to determine the existance of an element in "WorkQ"
4. "NodeLoad$" + ${node ID} is used to determing if a node is still alive, it stores how many tasks are waiting to be done by it.
5. "NodeOwner$" + ${node ID} is used to store the node owner
6. "NodeTaskHandled$" + ${node ID} is used to store how many tasks has this node handled
7. "AllNodes" is used to store all nodes online or offline
*/

const kNodeKeepAlive = `${redisConfig.nodeKeepAlive}`;

export default class NodeService {
  redisService: RedisService;
  nodeRepository: NodeRepository;
  honorService: HonorService;
  nodeTaskRepository: NodeTaskRepository;
  redis: Redis;

  constructor(inject: {
    redisService: RedisService;
    nodeRepository: NodeRepository;
    honorService: HonorService;
    nodeTaskRepository: NodeTaskRepository;
    redis: Redis;
  }) {
    this.redisService = inject.redisService;
    this.nodeRepository = inject.nodeRepository;
    this.honorService = inject.honorService;
    this.redis = inject.redis;
    this.nodeTaskRepository = inject.nodeTaskRepository;
    this.timer();
  }

  async createNodeID(address: string, userId: string) {
    const node_seq = await this.nodeRepository.getNextNodeSeq();
    logger.debug(node_seq);
    const nodeHash = await this.nodeRepository.saveNodeHash(BigInt(userId), address, node_seq);
    logger.debug(nodeHash);
    const nodeList = await this.nodeRepository.saveNode(node_seq, BigInt(userId), address);
    return nodeList[0];
  }

  async createNodeIDByNodeName(nodeName: string, userId: string) {
    const node_seq = await this.nodeRepository.getNextNodeSeq();
    logger.debug(node_seq);
    const nodeHash = await this.nodeRepository.saveNodeHashWithNodeName(BigInt(userId), nodeName, node_seq);
    logger.debug(nodeHash);
    const nodeList = await this.nodeRepository.saveNodeWithNodeName(node_seq, BigInt(userId), nodeName);
    return nodeList[0];
  }

  async getOrCreateNode(address: string, userId: string, createIfNotExists: boolean) {
    const nodeHash = await this.nodeRepository.getNodeHashByAccountAndWorker(BigInt(userId), address);

    if (nodeHash) {
      if (nodeHash.seq !== undefined) {
        const node = await this.nodeRepository.getNodeBySeq(nodeHash.seq!);
        logger.debug('node:', node);
        return node;
      }
    }
    if (createIfNotExists) {
      return await this.createNodeID(address, userId);
    } else {
      return undefined;
    }
  }

  async getOrCreateNodeByNodeName(nodeName: string, userId: string, createIfNotExists: boolean) {
    const nodeHash = await this.nodeRepository.getNodeHashByAccountAndNodeName(BigInt(userId), nodeName);
    if (nodeHash) {
      if (nodeHash.seq !== undefined) {
        const node = await this.nodeRepository.getNodeBySeq(nodeHash.seq!);
        logger.debug('current node:', node);
        return node;
      }

      if (createIfNotExists) {
        logger.info('create New node by nodeName', nodeName);
        return await this.createNodeIDByNodeName(nodeName, userId);
      } else {
        return undefined;
      }
    }
  }

  async getWorkerByNodeId(node_seq: bigint) {
    return await this.nodeRepository.getWorkerBySeq(node_seq);
  }

  async getNodeByNodeId(node_seq: bigint) {
    return await this.nodeRepository.getNodeBySeq(node_seq);
  }

  async removeNodeFromRepo(node_seq: bigint): Promise<void> {
    await this.nodeRepository.removeNode(node_seq);
  }

  async donateNode(node_seq: bigint): Promise<void> {
    await this.nodeRepository.donateNode(node_seq);
  }

  async onlineNode(node_seq: bigint): Promise<void> {
    await this.nodeRepository.onlineNode(node_seq);
  }
  async offlineNode(node_seq: bigint): Promise<void> {
    await this.nodeRepository.offlineNode(node_seq);
  }

  async hasOwnership(account_id: bigint, node_seq: bigint): Promise<boolean> {
    return await this.nodeRepository.hasNodeOwnership(account_id, node_seq);
  }

  async getNodeListbyAccountIdPaged(account_id: bigint, pageNo: number, pageSize: number) {
    return await this.nodeRepository.getNodeListByAccountIdPaged(account_id, pageNo, pageSize);
  }

  async getNodeListByType(type: number, pageNo: number, pageSize: number) {
    return await this.nodeRepository.getNodeListbyStatus(type, pageNo, pageSize);
  }

  async redisOperation(op: { (redis: Redis): Promise<void> }): Promise<boolean> {
    const redis = await this.redisService.acquire();
    if (!redis) {
      return false;
    }
    try {
      await op(redis);
      return true;
    } finally {
      this.redisService.release(redis);
    }
    return false;
  }

  async addNode(nodeInfo: { address: string; nodeId: string; userId: string }) {
    await this.redisOperation(async (redis: Redis) => {
      const evalResult = await redis.eval(
        `
local nodeId = KEYS[3]
local loadKey = "NodeLoad$" .. nodeId
redis.call("SET", "Svr$" .. KEYS[1], nodeId, "EX", KEYS[2])
redis.call("SETNX", loadKey, "0")
redis.call("EXPIRE", loadKey, KEYS[2])
redis.call("SADD", "AllNodes", nodeId)
if 1 == redis.call("SADD", "WorkQSet", KEYS[1]) then
    redis.call("RPUSH", "WorkQ", KEYS[1])
end
redis.call("SET", "NodeOwner$" .. nodeId, KEYS[4])
            `,
        4,
        [nodeInfo.address, kNodeKeepAlive, nodeInfo.nodeId, nodeInfo.userId],
      );
    });
  }

  async removeNode(nodeInfo: { address: string }) {
    await this.redisOperation(async (redis: Redis) => {
      const evalResult = await redis.eval(
        `
local node_addr = KEYS[1]
local nodeId = redis.call("GET", "Svr$" .. node_addr)
redis.call("DEL", "Svr$" .. node_addr, "NodeLoad$" .. nodeId)
            `,
        1,
        nodeInfo.address,
      );
    });
  }

  async getNextWorkerNode(): Promise<{ workerAddress: string | null; nodeId: string | null }> {
    let workerAddress: string | null = null;
    let nodeId: string | null = null;
    await this.redisOperation(async (redis: Redis) => {
      const evalResult = await redis.eval(
        `
while true do
    local result = redis.call("LPOP", "WorkQ")
    if not result then
        return nil
    end
    local nodeId = redis.call("GET", "Svr$" .. result)
    if not nodeId then
        redis.call("SREM", "WorkQSet", result)
    else
        redis.call("RPUSH", "WorkQ", result);
        redis.call("INCR", "NodeLoad$" .. nodeId)
        return { result, nodeId }
    end
end
            `,
        0,
      );
      workerAddress = (evalResult as string[])[0];
      nodeId = (evalResult as string[])[1];
    });
    return { workerAddress, nodeId };
  }

  async addNodeByNodeName(nodeInfo: { nodeName: string; nodeId: string; accountId: string }) {
    await this.redisOperation(async (redis: Redis) => {
      await redis.eval(
        `
local nodeId = KEYS[3]
redis.call("SET", "NodeName$" .. KEYS[1], nodeId, "EX", KEYS[2])
redis.call("SADD", "AllNodes", nodeId)
if 1 == redis.call("SADD", "WorkQSetByNodeName", KEYS[1]) then
    redis.call("RPUSH", "WorkQByNodeName", KEYS[1])
end
redis.call("SET", "NodeOwner$" .. nodeId, KEYS[4])
            `,
        4,
        [nodeInfo.nodeName, String(9), nodeInfo.nodeId, nodeInfo.accountId],
      );
    });
  }

  async removeNodeByNodeName(nodeName: string) {
    await this.redisOperation(async (redis: Redis) => {
      await redis.eval(
        `
local nodeName= KEYS[1]
redis.call("DEL", "NodeName$" .. nodeName)
            `,
        1,
        nodeName,
      );
    });
  }

  async getNextWorkerNodeByNodeName(): Promise<{ nodeName: string | null; nodeId: string | null }> {
    let nodeName: string | null = null;
    let nodeId: string | null = null;
    await this.redisOperation(async (redis: Redis) => {
      const evalResult = await redis.eval(
        `
while true do
    local nodeName = redis.call("LPOP", "WorkQByNodeName")
    if not nodeName then
        return nil
    end
    local nodeId = redis.call("GET", "NodeName$" .. nodeName)
    if not nodeId then
        redis.call("SREM", "WorkQSetByNodeName", nodeName)
    else
        redis.call("RPUSH", "WorkQByNodeName", nodeName);
        return { nodeName, nodeId }
    end
end
            `,
        0,
      );
      nodeName = (evalResult as string[])[0];
      nodeId = (evalResult as string[])[1];
    });
    return { nodeName, nodeId };
  }

  async increaseTasksHandled(nodeId: string) {
    await this.redisOperation(async (redis: Redis) => {
      redis.incr('NodeTaskHandled$' + nodeId);
      redis.decr('NodeLoad$' + nodeId);
    });
    await this.nodeRepository.increaseTasksHandled(BigInt(nodeId), 1);
  }

  async getAllStatistics(): Promise<string | null> {
    let result: string | null = null;
    await this.redisOperation(async (redis: Redis) => {
      const evalResult = await redis.eval(
        `
local allNodes = redis.call("SMEMBERS", "AllNodes")
local result = {}
for _, nodeId in pairs(allNodes) do
    local owner = redis.call("GET", "NodeOwner$" .. nodeId)
    local handled = redis.call("GET", "NodeTaskHandled$" .. nodeId)
    if not handled then
        handled = "0"
    end
    local load = redis.call("GET", "NodeLoad$" .. nodeId)
    if not load then
        load = "-1"
    end
    table.insert(result, nodeId .. "|" .. owner .. "|" .. handled .. "|" .. load)
end
return result
            `,
        0,
      );
      result = evalResult as string;
    });
    return result;
  }
  async getNodeTaskCount(nodeId: bigint): Promise<number> {
    let taskCount = 0;
    await this.redisOperation(async (redis: Redis) => {
      taskCount = parseInt((await redis.get('NodeTaskHandled$' + nodeId)) as string);
      if (Number.isNaN(taskCount)) {
        taskCount = 0;
      }
    });

    return taskCount;
  }

  async summaryMyNodeInfo(accountId: bigint) {
    const nodeCount = await this.nodeRepository.countByAccountId(accountId);
    const nodes = await this.nodeRepository.getAllNode(accountId);
    let taskHandlerCount = 0;
    if (!_.isEmpty(nodes)) {
      taskHandlerCount = await this.nodeTaskRepository.countByNodeSeqIn(nodes.map((node) => node.nodeSeq));
    }
    return { nodeCount: nodeCount, taskHandlerCount: taskHandlerCount };
  }

  timer() {
    const timedAwardForOnline = new Queue('timedAwardForOnline', { connection: this.redis });
    timedAwardForOnline.add('timer', { name: 'timer' }, { repeat: { pattern: '0 0/10 * * * ?' } });
    const worker = new Worker(
      'timedAwardForOnline',
      async () => {
        let pageNo = 1;
        const pageSize = 100;
        let nodes = await this.nodeRepository.getAllNodeByStatus(1, pageNo++, pageSize);
        while (nodes.length > 0) {
          await this.honorService.timedRewardForOnline(
            nodes.map((node) => ({
              nodeSeq: node.nodeSeq,
              accountId: node.accountId,
            })),
          );
          nodes = await this.nodeRepository.getAllNodeByStatus(1, pageNo++, pageSize);
        }
      },
      { connection: this.redis, concurrency: 1 },
    );
    worker.on('completed', async (job) => {
      // clear history task
      await (await worker.client).del(worker.toKey(job.id!));
    });
    worker.on('failed', (_, error) => {
      logger.error(error);
    });
  }
}
