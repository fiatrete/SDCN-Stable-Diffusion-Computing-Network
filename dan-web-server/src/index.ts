import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import logger from './utils/logger';
import dotenv from 'dotenv';
import { scopePerRequest } from 'awilix-koa';
import container from './containers/container';
import UserController from './controllers/UserController';
import config from './config';
import koaSession from 'koa-session';
import { errorHandler } from './utils/responseHandler';
import NodeControler from './controllers/NodeController';
import SdControler from './controllers/SdController';
import http from 'http';
import WebsocketService from './services/Websocket';

dotenv.config();

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());

app.keys = [config.serverConfig.koaSecretKey];

app.use(scopePerRequest(container));

app.use(
  koaSession(
    {
      key: 'koa:sess',
      maxAge: 24 * 60 * 60 * 7 * 1000,
      httpOnly: false,
      rolling: true,
      domain: config.serverConfig.domain,
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
container.resolve<WebsocketService>('websocketService').createWebSocketServer(server);

[
  container.resolve<UserController>('userController').router(),
  container.resolve<NodeControler>('nodeController').router(),
  container.resolve<SdControler>('sdController').router(),
  container.resolve<SdControler>('walletController').router(),
].forEach((subRouter) => {
  router.use('/api', subRouter.routes()).use('/api', subRouter.allowedMethods());
});

app.use(router.routes()).use(router.allowedMethods());
server.listen(config.serverConfig.port, () => {
  logger.info(`server has been launched on port ${config.serverConfig.port}.`);
});
