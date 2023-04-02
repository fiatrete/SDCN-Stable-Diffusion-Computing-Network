import { Knex } from 'knex';
import { User, userFields, userTable } from '../models';
import { SortDirection } from '../utils/SortDirection';

interface NodeSummaryWithAccount {
  nodeCount: number;
  account: {
    nickname: string;
    avatarImgUrl: string;
    email: string;
  };
  taskHandlerCount: number;
}

interface NodeSummaryWithAccountPaged {
  items: NodeSummaryWithAccount[];
  totalSize: number;
  totalPages: number;
}

export default class UserRepository {
  knex: Knex;

  constructor(inject: { knex: Knex }) {
    this.knex = inject.knex;
  }

  async save(user: User) {
    return await this.Users().insert(user).returning('*');
  }

  async getById(id: bigint) {
    return await this.Users().where({ id: id }).first();
  }
  async getByUuid(uuid: string) {
    return await this.Users().where(userFields.uuid, uuid).first();
  }

  async getAll() {
    return await this.Users().orderBy(userFields.id, SortDirection.Desc);
  }

  async getNodeSummaryWithAccountPaged(pageNo: number, pageSize: number): Promise<NodeSummaryWithAccountPaged> {
    const countResult = await this.knex('account').select(this.knex.raw('count(*) as total_size')).first();
    const { totalSize } = countResult;
    const offset = (pageNo - 1) * pageSize;
    const result = await this.knex('node')
      .join('account', 'node.account_id', '=', 'account.id')
      .select(
        'node.account_id',
        this.knex.raw('count(CASE WHEN node.deleted = 1 THEN null ELSE node.id END) as node_count'),
        this.knex.raw('sum(node.task_count) as task_count'),
        'account.nickname',
        'account.avatar_img',
        'account.email',
      )
      .groupBy('node.account_id', 'account.nickname', 'account.avatar_img', 'account.email')
      .orderBy('task_count', SortDirection.Desc)
      .offset(offset)
      .limit(pageSize);

    const items = result.map(({ nodeCount, nickname, avatarImg, email, taskCount }) => ({
      nodeCount: nodeCount,
      account: { nickname, avatarImgUrl: avatarImg, email },
      taskHandlerCount: taskCount,
    }));

    const totalPages = Math.ceil(totalSize / pageSize);

    return {
      items,
      totalSize: parseInt(totalSize),
      totalPages,
    };
  }

  async raw(sql: string) {
    return await this.knex.raw(sql);
  }

  Users() {
    return this.knex<User>(userTable);
  }
}