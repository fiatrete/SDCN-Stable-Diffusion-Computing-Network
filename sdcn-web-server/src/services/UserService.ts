import { User } from '../models';
import { RedisService, UserRepository } from '../repositories';
import logger from '../utils/logger';
import _ from 'lodash';

export default class UserService {
  userRepository: UserRepository;
  redisService: RedisService;

  constructor(inject: { userRepository: UserRepository; redisService: RedisService }) {
    this.redisService = inject.redisService;
    this.userRepository = inject.userRepository;
  }

  async helloWorld() {
    return await this.userRepository.raw('select now()');
  }

  async hello(id: number) {
    const user = await this.userRepository.getById(id);
    logger.info(`user info ${id}, ${user?.id}, ${user?.name}, ${user?.age}, ${user?.addressHome}`);
    return user;
  }

  async helloCreate(user?: User) {
    logger.info(`insert before: ${user}`);
    if (!_.isNil(user) && !_.isNaN(user)) {
      const result = await this.userRepository.save(user);
      logger.info(`insert after: ${result}`);
    }
  }

  async world() {
    return await this.userRepository.getAll();
  }
}
