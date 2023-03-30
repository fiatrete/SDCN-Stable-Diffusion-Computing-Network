import { asClass, asValue, createContainer } from 'awilix';
import UserController from '../controllers/UserController';
import UserService from '../services/UserService';
import database from '../utils/database';

const container = createContainer();

container.register({
  knex: asValue(database.knex),
  redis: asValue(database.redis),
  userService: asClass(UserService)
    .inject(() => ({ knex: database.knex, redis: database.redis }))
    .singleton(),
  userController: asClass(UserController)
    .inject(() => ({ userService: container.resolve<UserService>('userService') }))
    .singleton(),
});

export default container;
