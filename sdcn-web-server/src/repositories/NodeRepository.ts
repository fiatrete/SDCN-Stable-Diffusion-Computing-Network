import { Knex } from 'knex';
import { isNil } from 'lodash';
import logger from '../utils/logger';
import { SortDirection } from '../utils/SortDirection';

interface Node {
  id?: bigint;
  node_seq: bigint;
  account_id: bigint;
  task_count: number;
  worker: string;
  status: number;
  deleted: number;
  create_time: Date;
  last_modify_time: Date;
}
type NodeFields = keyof Node;
const nodeFields: Record<NodeFields, string> = {
  id: 'id',
  node_seq: 'node_seq',
  account_id: 'account_id',
  task_count: 'task_count',
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
      node_seq: node_seq,
      account_id: account_id,
      task_count: 0,
      worker: worker,
      status: 1,
      deleted: 0,
      create_time: new Date(),
      last_modify_time: new Date(),
    };
    return await this.Nodes().insert(node).returning('*');
  }

  async getNodeBySeq(node_seq: bigint) {
    return await this.Nodes().where({ node_seq: node_seq }).first();
  }

  async getAllNodes() {
    return await this.Nodes().orderBy(nodeFields.id, SortDirection.Desc);
  }

  async hasNodeOwnership(account_id: bigint, node_seq: bigint): Promise<boolean> {
    const result = await this.Nodes().select('id').where({ account_id, node_seq: node_seq }).limit(1);
    return result.length > 0;
  }

  async removeNode(node_seq: bigint) {
    return await this.Nodes().update({ deleted: 1, last_modify_time: new Date() }).where({ node_seq: node_seq });
  }

  async onlineNode(node_seq: bigint) {
    return await this.Nodes()
      .update({ deleted: 0, status: 1, last_modify_time: new Date() })
      .where({ node_seq: node_seq });
  }

  async offlineNode(node_seq: bigint) {
    return await this.Nodes().update({ status: 0, last_modify_time: new Date() }).where({ node_seq: node_seq });
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
