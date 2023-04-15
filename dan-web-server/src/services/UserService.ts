import { User } from '../models';
import { RedisService, UserRepository } from '../repositories';
import logger from '../utils/logger';
import _ from 'lodash';
import randomstring from 'randomstring';
import { Knex } from 'knex';
import { HonorRecordType, RoleType } from '../models/enum';
import HonorService from './HonorService';
import config from '../config';

export default class UserService {
  userRepository: UserRepository;
  redisService: RedisService;
  knex: Knex;
  honorService: HonorService;

  constructor(inject: {
    userRepository: UserRepository;
    redisService: RedisService;
    honorService: HonorService;
    knex: Knex;
  }) {
    this.redisService = inject.redisService;
    this.userRepository = inject.userRepository;
    this.knex = inject.knex;
    this.honorService = inject.honorService;
  }

  async helloWorld() {
    return await this.userRepository.raw('select now()');
  }

  async helloCreate(user?: User) {
    logger.debug(`insert before: ${user}`);
    if (!_.isNil(user) && !_.isNaN(user)) {
      const result = await this.userRepository.save(user);
      logger.debug(`insert after: ${result}`);
    }
  }

  async checkAccount(uuid: string): Promise<User> {
    const user = await this.userRepository.getByUuid(uuid);
    logger.debug(
      `user info ${uuid}, ${user?.id}, ${user?.uuid}, ${user?.nickname}, ${user?.email}, ${user?.avatarImg}`,
    );
    return user as User;
  }

  async createAccount(user: User) {
    const apiKey = `sk-${randomstring.generate({ length: 48, charset: 'alphanumeric' })}`;
    _.assign(user, { role: RoleType.Default, honorAmount: 0, apiKey });
    user = await this.userRepository.save(user);
    this.honorService.mintHonor(user.id, HonorRecordType.Present);
    this.redisService.setFirstTimeLogin(user.id);
    return user;
  }

  async getUserInfo(id: bigint) {
    const user = await this.userRepository.getById(id);
    logger.debug(`user info ${id}, ${user?.id}, ${user?.nickname}, ${user?.email}, ${user?.avatarImg}`);
    return user;
  }

  async getNodeSummaryWithAccountPaged(pageNo: number, pageSize: number) {
    return await this.userRepository.getNodeSummaryWithAccountPaged(pageNo, pageSize);
  }

  async world() {
    return await this.userRepository.getAll();
  }

  async getByApiKey(apiKey: string) {
    return await this.userRepository.getByApiKey(apiKey);
  }

  async getById(id: bigint) {
    return await this.userRepository.getById(id);
  }

  async isFirstTimeLogin(id: bigint): Promise<boolean> {
    return await this.redisService.isFirstTimeLogin(id);
  }

  async getPublicApiKey() {
    return _.pick(await this.userRepository.getById(config.serverConfig.publicUserId), ['apiKey']);
  }
}
