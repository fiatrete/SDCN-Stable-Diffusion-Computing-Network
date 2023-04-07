import IORedis from 'ioredis';

export default class RedisService {
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
}
