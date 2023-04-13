import { Knex } from 'knex';
import { isNil } from 'lodash';
import logger from '../utils/logger';
import { SortDirection } from '../utils/SortDirection';

interface Node {
  id?: bigint;
  nodeSeq: bigint;
  accountId: bigint;
  taskCount: number;
  worker: string;
  status: number;
  deleted: number;
  create_time: Date;
  last_modify_time: Date;
}
type NodeFields = keyof Node;
const nodeFields: Record<NodeFields, string> = {
  id: 'id',
  nodeSeq: 'nodeSeq',
  accountId: 'accountId',
  taskCount: 'taskCount',
  worker: 'worker',
  status: 'status',
  deleted: 'deleted',
  create_time: 'create_time',
  last_modify_time: 'last_modify_time',
};
const nodeTable = 'node';

export interface NodeHash {
  account_id: bigint;
  worker: string;
  seq: bigint;
}
type NodeHashFields = keyof NodeHash;

const nodeHashFields: Record<NodeHashFields, string> = {
  account_id: 'account_id',
  worker: 'worker',
  seq: 'seq',
};
const nodeHashTable = 'node_hash';

export default class NodeRepository {
  knex: Knex;

  constructor(inject: { knex: Knex }) {
    this.knex = inject.knex;
  }

  async saveNode(node_seq: bigint, account_id: bigint, worker: string) {
    const node: Node = {
      nodeSeq: node_seq,
      accountId: account_id,
      taskCount: 0,
      worker: worker,
      status: 1,
      deleted: 0,
      create_time: new Date(),
      last_modify_time: new Date(),
    };
    return await this.Nodes().insert(node).returning('*');
  }

  async getNodeBySeq(node_seq: bigint) {
    return await this.Nodes().where({ nodeSeq: node_seq }).first();
  }

  async getWorkerBySeq(node_seq: bigint) {
    const node = await this.Nodes().where({ nodeSeq: node_seq }).first();
    if (node === undefined) {
      return '';
    } else {
      return node.worker;
    }
  }

  async getNodeListbyStatus(type: number, pageNo: number, pageSize: number): Promise<Node[]> {
    if (type === 0) {
      const nodes = await this.Nodes()
        .where({ deleted: 0 })
        .offset((pageNo - 1) * pageSize)
        .limit(pageSize)
        .orderBy([
          { column: 'task_count', order: SortDirection.Desc },
          { column: 'node_seq', order: SortDirection.Asc },
        ]);
      return nodes;
    } else if (type === 1) {
      const nodes = await this.Nodes()
        .where({ status: 1, deleted: 0 })
        .offset((pageNo - 1) * pageSize)
        .limit(pageSize)
        .orderBy([
          { column: 'task_count', order: SortDirection.Desc },
          { column: 'node_seq', order: SortDirection.Asc },
        ]);
      return nodes;
    }
    return [];
  }

  async getNodeListByAccountIdPaged(account_id: bigint, pageNo: number, pageSize: number): Promise<Node[]> {
    return await this.Nodes()
      .select('node_seq as nodeId', 'worker', 'status', 'task_count as taskHandlerCount')
      .where({ accountId: account_id, deleted: 0 })
      .offset((pageNo - 1) * pageSize)
      .limit(pageSize)
      .orderBy([
        { column: 'task_count', order: SortDirection.Desc },
        { column: 'node_seq', order: SortDirection.Asc },
      ]);
  }

  async hasNodeOwnership(account_id: bigint, node_seq: bigint): Promise<boolean> {
    const result = await this.Nodes().select('id').where({ accountId: account_id, nodeSeq: node_seq }).limit(1);
    return result.length > 0;
  }

  async donateNode(node_seq: bigint) {
    return await this.Nodes()
      .update({ deleted: 0, status: 1, last_modify_time: new Date() })
      .where({ nodeSeq: node_seq });
  }

  async removeNode(node_seq: bigint) {
    return await this.Nodes().update({ deleted: 1, last_modify_time: new Date() }).where({ nodeSeq: node_seq });
  }

  async onlineNode(node_seq: bigint) {
    return await this.Nodes().update({ status: 1, last_modify_time: new Date() }).where({ nodeSeq: node_seq });
  }

  async offlineNode(node_seq: bigint) {
    return await this.Nodes().update({ status: 2, last_modify_time: new Date() }).where({ nodeSeq: node_seq });
  }

  async increaseTasksHandled(nodeSeq: bigint, count: number) {
    await this.Nodes().where({ nodeSeq: nodeSeq }).increment('task_count', count);
  }

  async raw(sql: string) {
    return await this.knex.raw(sql);
  }

  Nodes() {
    return this.knex<Node>(nodeTable);
  }

  async getNodeHashByAccountAndWorker(account_id: bigint, worker: string): Promise<NodeHash | undefined> {
    return await this.NodeHashs().where({ account_id: account_id, worker: worker }).first();
  }

  async saveNodeHash(account_id: bigint, worker: string, seq: bigint) {
    const nodeHash: NodeHash = {
      account_id: account_id,
      worker: worker,
      seq: seq,
    };
    logger.info(nodeHash);
    return await this.NodeHashs().insert(nodeHash).returning('*');
  }

  async getNextNodeSeq() {
    const result = await this.knex.raw("SELECT nextval('node_seq')");
    return result.rows[0].nextval;
  }

  NodeHashs() {
    return this.knex<NodeHash>(nodeHashTable);
  }
}
