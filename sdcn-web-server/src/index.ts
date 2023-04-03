import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import CSRF from 'koa-csrf';
import logger from './utils/logger';
import dotenv from 'dotenv';
import cors from 'koa-cors';
import { scopePerRequest } from 'awilix-koa';
import container from './containers/container';
import UserController from './controllers/UserController';
import config from './config';
import koaSession from 'koa-session';
import { errorHandler } from './utils/responseHandler';
import NodeControler from './controllers/NodeController';
import bodyParser from 'koa-bodyparser';
import SdControler from './controllers/SdController';

dotenv.config();

const app = new Koa();
const router = new Router();

app.keys = [config.serverConfig.koaSecretKey];

app.use(scopePerRequest(container));
// This middleware causes our post request crash, thus disable it
// app.use(new CSRF());
app.use(
  koaSession(
    {
      key: 'koa:sess',
      maxAge: 24 * 60 * 60 * 7,
      httpOnly: false,
      rolling: true,
    },
    app,
  ),
);
app.use(
  koaBody({
    jsonLimit: config.serverConfig.requestJsonLimitSize,
  }),
);
app.use(errorHandler);

[
  container.resolve<UserController>('userController').router(),
  container.resolve<NodeControler>('nodeController').router(),
  container.resolve<SdControler>('sdController').router(),
].forEach((subRouter) => {
  router.use('/api', subRouter.routes()).use('/api', subRouter.allowedMethods());
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(config.serverConfig.port, () => {
  logger.info(`server has been launched on port ${config.serverConfig.port}.`);
});
