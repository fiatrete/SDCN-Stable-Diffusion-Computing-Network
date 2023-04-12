import { Knex } from 'knex';
import { NodeTask, nodeTaskFields, nodeTaskTable } from '../models';
import _ from 'lodash';

export default class NodeTaskRepository {
  knex: Knex;

  constructor(inject: { knex: Knex }) {
    this.knex = inject.knex;
  }

  async getById(id: string) {
    return await this.NodeTaskTable().where({ id }).first;
  }

  async save(nodeTask: NodeTask): Promise<NodeTask> {
    const obj = _.toArray(await this.NodeTaskTable().insert(nodeTask).returning('*'))[0] as NodeTask;
    nodeTask.id = obj.id;
    return nodeTask;
  }

  // update as initiate image generate
  async updateNodeSeqAndStatus(nodeTask: NodeTask) {
    await this.NodeTaskTable()
      .update(_.extend(_.pick(nodeTask, ['nodeSeq', 'status']), { lastModifyTime: new Date() }))
      .where({ id: nodeTask.id });
  }

  async updateStatus(nodeTask: NodeTask) {
    const updateData = _.extend(_.pick(nodeTask, ['status', 'finishTime']), { lastModifyTime: new Date() });
    await this.NodeTaskTable().update(updateData).where({ id: nodeTask.id });
  }

  async countAll() {
    const results = await this.NodeTaskTable().count();
    return _.toNumber(results[0].count);
  }

  async countByCreateTime(startTime: Date, endTime: Date) {
    const results = await this.NodeTaskTable().count().whereBetween(nodeTaskFields.createTime, [startTime, endTime]);
    return _.toNumber(results[0].count);
  }

  NodeTaskTable() {
    return this.knex<NodeTask>(nodeTaskTable);
  }
}
