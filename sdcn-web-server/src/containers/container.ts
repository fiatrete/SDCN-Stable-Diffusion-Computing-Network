import { asClass, asValue, createContainer } from 'awilix';
import UserController from '../controllers/UserController';
import { RedisService, UserRepository } from '../repositories';
import UserService from '../services/UserService';
import database from '../utils/database';

const container = createContainer();

container.register({
  knex: asValue(database.knex),
  redis: asValue(database.redis),
  userRepository: asClass(UserRepository)
    .inject(() => ({ knex: database.knex }))
    .singleton(),
  redisService: asClass(RedisService)
    .inject(() => ({ knex: database.knex }))
    .singleton(),
  userService: asClass(UserService)
    .inject(() => ({
      userRepository: container.resolve<UserRepository>('userRepository'),
      redisService: container.resolve<RedisService>('redisService'),
    }))
    .singleton(),
  userController: asClass(UserController)
    .inject(() => ({ userService: container.resolve<UserService>('userService') }))
    .singleton(),
});

export default container;
