import { Knex } from 'knex';
import { NodeTask, nodeTaskFields, nodeTaskTable } from '../models';
import _ from 'lodash';
import { NodeTaskStatus } from '../models/enum';

export default class NodeTaskRepository {
  knex: Knex;

  constructor(inject: { knex: Knex }) {
    this.knex = inject.knex;
  }

  async getById(id: string) {
    return await this.NodeTasks().where({ id }).first();
  }

  async save(nodeTask: NodeTask): Promise<NodeTask> {
    const obj = _.toArray(await this.NodeTasks().insert(nodeTask).returning('*'))[0] as NodeTask;
    nodeTask.id = obj.id;
    return nodeTask;
  }

  // update as initiate image generate
  async updateNodeSeqAndStatus(nodeTask: NodeTask) {
    await this.NodeTasks()
      .update(_.extend(_.pick(nodeTask, ['nodeSeq', 'status']), { lastModifyTime: new Date() }))
      .where({ id: nodeTask.id });
  }

  async updateStatus(nodeTask: NodeTask) {
    const updateData = _.extend(_.pick(nodeTask, ['status', 'finishTime']), { lastModifyTime: new Date() });
    await this.NodeTasks()
      .update(updateData)
      .where({ id: nodeTask.id, [nodeTaskFields.status]: NodeTaskStatus.Processing });
  }

  async countAll() {
    const results = await this.NodeTasks()
      .count()
      .where({ [nodeTaskFields.status]: NodeTaskStatus.Success });
    return _.toNumber(results[0].count);
  }

  async countByCreateTime(startTime: Date, endTime: Date) {
    const results = await this.NodeTasks()
      .count()
      .whereBetween(nodeTaskFields.createTime, [startTime, endTime])
      .where({ [nodeTaskFields.status]: NodeTaskStatus.Success });
    return _.toNumber(results[0].count);
  }

  async countByNodeSeqIn(nodeSeqArray: bigint[]) {
    const results = await this.NodeTasks()
      .count()
      .where({ [nodeTaskFields.status]: NodeTaskStatus.Success })
      .whereIn(
        nodeTaskFields.nodeSeq,
        _.map(nodeSeqArray, (nodeSeq) => _.toString(nodeSeq)),
      );
    return _.toNumber(results[0].count);
  }

  NodeTasks() {
    return this.knex<NodeTask>(nodeTaskTable);
  }
}
