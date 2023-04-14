export interface HonorRecord {
  id: bigint;
  accountId: bigint;
  payerId: bigint;
  type: number;
  amount: bigint;
  nodeSeq: bigint;
  taskId: string;
  createTime: Date;
}

type HonorRecordFields = keyof HonorRecord;
export const honorRecordFields: Record<HonorRecordFields, string> = {
  id: 'id',
  accountId: 'account_id',
  payerId: 'payer_id',
  type: 'type',
  amount: 'amount',
  nodeSeq: 'node_seq',
  taskId: 'task_id',
  createTime: 'create_time',
};

export const honorRecordTable = 'honor_record';
