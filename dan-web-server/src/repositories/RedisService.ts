import IORedis from 'ioredis';
import { JsonObject } from '../utils/json';
import _ from 'lodash';

export default class RedisService {
  taskQueueRedisKey = 'dan:xxx2img:task-queue';
  taskQueueProcessingRedisKey = 'dan:xxx2img:task-queue-processing';
  taskInfoRedisKeyPrefix = 'dan:xxx2img:task:';
  taskStatusRedisKeyPrefix = 'dan:xxx2img:task-result:';

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

  async pushToTaskQueue(taskId: string, requestBody: JsonObject) {
    const pipeline = this.redis.multi();
    pipeline.rpush(this.taskQueueRedisKey, taskId);
    pipeline.set(`${this.taskInfoRedisKeyPrefix}${taskId}`, JSON.stringify(requestBody));
    pipeline.set(
      `${this.taskStatusRedisKeyPrefix}${taskId}`,
      JSON.stringify({ taskId, status: 0, queuePosition: await this.lengthTaskQueue() }),
    );
    await pipeline.exec();
  }

  async popFromTaskQueue() {
    const taskId = await this.redis.lpop(this.taskQueueRedisKey);
    await this.redis.set(
      `${this.taskStatusRedisKeyPrefix}${taskId}`,
      JSON.stringify({ taskId, status: 1, queuePosition: 0 }),
    );
  }

  async batchPopFromTaskQueue(count = 10) {
    const taskIds = await this.redis.lrange(this.taskQueueRedisKey, 0, count - 1);

    const taskStatusArray = taskIds.map((taskId) => {
      return { taskId, status: 1, queuePosition: 0 };
    });

    await this.updateTaskStatus(taskStatusArray);
    await this.redis.ltrim(this.taskQueueRedisKey, count, -1);

    const taskIdRedisKeys = taskIds.map((taskId) => `${this.taskInfoRedisKeyPrefix}${taskId}`);
    return (await this.redis.mget(taskIdRedisKeys)).map((value) => (value == null ? null : JSON.parse(value)));
  }

  async pushToTaskQueueProcessing(taskId: string) {
    const pipeline = this.redis.multi();
    pipeline.rpush(this.taskQueueProcessingRedisKey, taskId);
    pipeline.set(`${this.taskStatusRedisKeyPrefix}${taskId}`, JSON.stringify({ taskId, status: 1, queuePosition: 0 }));
    await pipeline.exec();
  }

  async popFromTaskQueueProcessing(taskId: string, taskResult: JsonObject) {
    const pipeline = this.redis.multi();
    pipeline.lrem(this.taskQueueProcessingRedisKey, 1, taskId);
    pipeline.set(`${this.taskStatusRedisKeyPrefix}${taskId}`, JSON.stringify(taskResult));
    pipeline.expire(`${this.taskInfoRedisKeyPrefix}${taskId}`, 60 * 2);
    pipeline.expire(`${this.taskStatusRedisKeyPrefix}${taskId}`, 60 * 2);
    await pipeline.exec();
  }

  async lengthTaskQueue() {
    return await this.redis.llen(this.taskQueueRedisKey);
  }

  async getTaskStatus(taskId: string) {
    return await this.redis.get(`${this.taskStatusRedisKeyPrefix}${taskId}`);
  }

  async getAllTaskFromQueue() {
    return await this.redis.lrange(this.taskQueueRedisKey, 0, -1);
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
  }
}
