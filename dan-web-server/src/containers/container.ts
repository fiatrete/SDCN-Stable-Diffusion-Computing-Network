import { asClass, asValue, createContainer } from 'awilix';
import NodeControler from '../controllers/NodeController';
import SdControler from '../controllers/SdController';
import UserController from '../controllers/UserController';
import {
  NodeRepository,
  RedisService,
  UserRepository,
  NodeTaskRepository,
  HonorRecordRepository,
} from '../repositories';
import NodeService from '../services/NodeService';
import SdService from '../services/SdService';
import UserService from '../services/UserService';
import database from '../utils/database';
import { HonorService } from '../services';
import WalletController from '../controllers/WalletController';

const container = createContainer();

container.register({
  knex: asValue(database.knex),
  redis: asValue(database.redis),
  userRepository: asClass(UserRepository)
    .inject(() => ({ knex: database.knex }))
    .singleton(),
  nodeRepository: asClass(NodeRepository)
    .inject(() => ({ knex: database.knex }))
    .singleton(),
  nodeTaskRepository: asClass(NodeTaskRepository)
    .inject(() => ({ knex: database.knex }))
    .singleton(),
  honorRecordRepository: asClass(HonorRecordRepository)
    .inject(() => ({ knex: database.knex }))
    .singleton(),
  redisService: asClass(RedisService)
    .inject(() => ({ knex: database.redis }))
    .singleton(),
  honorService: asClass(HonorService)
    .inject(() => ({
      userRepository: container.resolve<UserRepository>('userRepository'),
      nodeRepository: container.resolve<NodeRepository>('nodeRepository'),
      honorRecordRepository: container.resolve<HonorRecordRepository>('honorRecordRepository'),
    }))
    .singleton(),
  userService: asClass(UserService)
    .inject(() => ({
      userRepository: container.resolve<UserRepository>('userRepository'),
      redisService: container.resolve<RedisService>('redisService'),
      honorService: container.resolve<HonorService>('honorService'),
      knex: database.knex,
    }))
    .singleton(),
  userController: asClass(UserController)
    .inject(() => ({
      userService: container.resolve<UserService>('userService'),
      nodeService: container.resolve<NodeService>('nodeService'),
    }))
    .singleton(),
  nodeService: asClass(NodeService)
    .inject(() => ({
      redisService: container.resolve<RedisService>('redisService'),
      nodeRepository: container.resolve<NodeRepository>('nodeRepository'),
    }))
    .singleton(),
  nodeController: asClass(NodeControler)
    .inject(() => ({
      nodeService: container.resolve<NodeService>('nodeService'),
      userService: container.resolve<UserService>('userService'),
    }))
    .singleton(),
  sdService: asClass(SdService)
    .inject(() => ({
      nodeService: container.resolve<NodeService>('nodeService'),
      redisService: container.resolve<RedisService>('redisService'),
      nodeTaskRepository: container.resolve<NodeTaskRepository>('nodeTaskRepository'),
      honorService: container.resolve<HonorService>('honorService'),
    }))
    .singleton(),
  sdController: asClass(SdControler)
    .inject(() => ({ sdService: container.resolve<SdService>('sdService') }))
    .singleton(),
  walletController: asClass(WalletController)
    .inject(() => ({ honorService: container.resolve<HonorService>('honorService') }))
    .singleton(),
});

export default container;
