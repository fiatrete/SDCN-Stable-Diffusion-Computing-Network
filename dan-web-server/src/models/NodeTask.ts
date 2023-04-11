export default interface NodeTask {
  id: string;
  nodeSeq: number;
  taskType: number;
  model: string;
  status: number;
  finishTime: Date;
  createTime: Date;
  lastModifyTime: Date;
}

type NodeTaskFields = keyof NodeTask;

export const nodeTaskFields: Record<NodeTaskFields, string> = {
  id: 'id',
  nodeSeq: 'node_seq',
  taskType: 'task_type',
  model: 'model',
  status: 'status',
  finishTime: 'finish_time',
  createTime: 'create_time',
  lastModifyTime: 'last_modify_time',
};

export const nodeTaskTable = 'node_task';
