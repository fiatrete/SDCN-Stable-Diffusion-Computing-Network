import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import CSRF from 'koa-csrf';
import logger from './utils/logger';
import dotenv from 'dotenv';
import { scopePerRequest } from 'awilix-koa';
import container from './containers/container';
import UserController from './controllers/UserController';
import config from './config';
import koaSession from 'koa-session';
import { errorHandler } from './utils/responseHandler';
import NodeControler from './controllers/NodeController';

dotenv.config();

const app = new Koa();
const router = new Router();

app.keys = [config.serverConfig.koaSecretKey];

app.use(scopePerRequest(container));
app.use(new CSRF());
app.use(
  koaSession(
    {
      key: 'koa:sess',
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      rolling: true,
    },
    app,
  ),
);
app.use(koaBody());
app.use(errorHandler);

const userRouter = container.resolve<UserController>('userController').router();
const nodeRouter = container.resolve<NodeControler>('nodeController').router();
router.use('/api', userRouter.routes()).use('/api', userRouter.allowedMethods());
router.use('/api', nodeRouter.routes()).use('/api', nodeRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());
app.listen(config.serverConfig.port, () => {
  logger.info(`server has been launched on port ${config.serverConfig.port}.`);
});
