import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import CSRF from 'koa-csrf';
import koaBodyparser from 'koa-bodyparser';
import logger from './utils/logger';
import dotenv from 'dotenv';
import { scopePerRequest } from 'awilix-koa';
import container from './containers/container';
import UserController from './controllers/UserController';
import config from './config';

dotenv.config();

const app = new Koa();
const router = new Router();

app.use(scopePerRequest(container));
app.use(koaBody());
app.use(new CSRF());
app.use(koaBodyparser());

const userRouter = container.resolve<UserController>('userController').router();
router.use('/api', userRouter.routes()).use('/api', userRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.serverConfig.port, () => {
  logger.info(`server has been launched on port ${config.serverConfig.port}.`);
});
