import IORedis from 'ioredis';

export default class RedisService {
  redis: IORedis;

  constructor(inject: { redis: IORedis }) {
    this.redis = inject.redis;
  }
}
