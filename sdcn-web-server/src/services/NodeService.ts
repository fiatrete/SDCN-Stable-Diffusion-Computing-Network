import { Redis } from 'ioredis';
import { Primitive } from 'lodash';
import redisConfig from '../config/redisConfig';
import { RedisService, NodeRepository } from '../repositories';
import logger from '../utils/logger';

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

  constructor(inject: { redisService: RedisService; nodeRepository: NodeRepository }) {
    this.redisService = inject.redisService;
    this.nodeRepository = inject.nodeRepository;
  }

  async createNodeID(address: string, userId: string) {
    const node_seq = await this.nodeRepository.getNextNodeSeq();
    logger.debug(node_seq);
    const nodeHash = await this.nodeRepository.saveNodeHash(BigInt(userId), address, node_seq);
    logger.debug(nodeHash);
    const nodeList = await this.nodeRepository.saveNode(node_seq, BigInt(userId), address);
    return nodeList[0];
  }

  async getOrCreateNode(address: string, userId: string, createIfNotExists: boolean) {
    // TODO: get or generate worker ID from database
    // use node_hash to check exist
    const nodeHash = await this.nodeRepository.getNodeHashByAccountAndWorker(BigInt(userId), address);

    if (nodeHash) {
      if (nodeHash.seq === undefined) {
        return await this.createNodeID(address, userId);
      } else {
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

  async getNodeListbyAccountId(account_id: bigint) {
    return await this.nodeRepository.getNodeListByAccountId(account_id);
  }

  async getNodeListByType(type: number, pageNo: number, pageSize: number) {
    return await this.nodeRepository.getNodeListbyStatus(type, pageNo, pageSize);
  }
  async getNodeCountByType(type: number) {
    return await this.nodeRepository.getNodeCountbyStatus(type);
  }
  async getNodeCountByAcccountId(account_id: bigint) {
    return await this.nodeRepository.getNodeCountByAcccountId(account_id);
  }

  async getAllUndeletedNodeList() {
    return await this.nodeRepository.getAllUndeletedNodes();
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

  async increaseTasksHandled(nodeId: string) {
    await this.redisOperation(async (redis: Redis) => {
      redis.incr('NodeTaskHandled$' + nodeId);
      redis.decr('NodeLoad$' + nodeId);
    });
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
}
