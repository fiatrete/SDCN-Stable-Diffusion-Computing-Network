import IORedis from 'ioredis';
import _ from 'lodash';
import { NodeTaskStatus } from '../models/enum';

export default class RedisService {
  taskStatusRedisKeyPrefix = 'dan:xxx2img:task-result:';
  userTaskCounterPrefix = 'dan:xxx2img:user-task-count:';
  userFirstTimeLoginPrefix = 'dan:user:first-time-login:';

  redis: IORedis;

  constructor(inject: { redis: IORedis }) {
    this.redis = inject.redis;
  }

  async acquire(): Promise<IORedis> {
    return new Promise<IORedis>((resolve) => {
      resolve(this.redis); // TODO: Acquire a a free instance of redis client
    });
  }

  release(redis: IORedis) {
    // TODO: return a redis client back
  }

  async getTaskStatus(taskId: string) {
    return await this.redis.get(`${this.taskStatusRedisKeyPrefix}${taskId}`);
  }

  async updateTaskStatus(taskStatusArray: { taskId: string; queuePosition: number; status: number }[]) {
    const taskStatusBatchUpdateData = _.mapKeys(
      _.mapValues(
        _.keyBy(taskStatusArray, (taskStatus) => taskStatus.taskId),
        (value) => JSON.stringify(value),
      ),
      (vlaue, key) => `${this.taskStatusRedisKeyPrefix}${key}`,
    );
    await this.redis.mset(taskStatusBatchUpdateData);
    _.filter(
      taskStatusArray,
      (taskStatusResult) =>
        taskStatusResult.status == NodeTaskStatus.Success || taskStatusResult.status == NodeTaskStatus.Failure,
    ).forEach((taskStatusResult) => {
      this.redis.expire(`${this.taskStatusRedisKeyPrefix}${taskStatusResult.taskId}`, 60 * 2);
    });
  }

  async userTaskCounterIncr(userId: bigint) {
    await this.redis.incr(`${this.userTaskCounterPrefix}${userId}`);
  }

  async userTaskCounterDecr(userId: bigint) {
    await this.redis.decr(`${this.userTaskCounterPrefix}${userId}`);
  }

  async getUserTaskCount(userId: bigint) {
    return await this.redis.get(`${this.userTaskCounterPrefix}${userId}`);
  }

  async isFirstTimeLogin(userId: bigint) {
    const result = await this.redis.exists(`${this.userFirstTimeLoginPrefix}${userId}`);
    await this.redis.expire(`${this.userFirstTimeLoginPrefix}${userId}`, 2);
    return result > 0;
  }

  async setFirstTimeLogin(userId: bigint) {
    await this.redis.set(`${this.userFirstTimeLoginPrefix}${userId}`, 1);
  }
}
