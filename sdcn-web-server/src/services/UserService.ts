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

  async helloCreate(user?: User) {
    logger.info(`insert before: ${user}`);
    if (!_.isNil(user) && !_.isNaN(user)) {
      const result = await this.userRepository.save(user);
      logger.info(`insert after: ${result}`);
    }
  }

  async checkAccount(uuid: string): Promise<User> {
    const user = await this.userRepository.getByUuid(uuid);
    logger.info(`user info ${uuid}, ${user?.id}, ${user?.uuid}, ${user?.nickname}, ${user?.email}, ${user?.avatarImg}`);
    return user as User;
  }

  async createAccount(user: User) {
    return await this.userRepository.save(user);
  }

  async getUserInfo(id: bigint) {
    const user = await this.userRepository.getById(id);
    logger.info(`user info ${id}, ${user?.id}, ${user?.nickname}, ${user?.email}, ${user?.avatarImg}`);
    return user;
  }

  async getNodeSummaryWithAccountPaged(pageNo: number, pageSize: number) {
    return await this.userRepository.getNodeSummaryWithAccountPaged(pageNo, pageSize);
  }

  async world() {
    return await this.userRepository.getAll();
  }
}
