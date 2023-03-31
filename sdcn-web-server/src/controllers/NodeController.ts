import { Context } from 'koa';
import Router from 'koa-router';
import { RequireLoginAsync } from '../annotators/RequireLogin';
import NodeService from '../services/NodeService';
import Hasher from '../utils/Hasher';
import logger from '../utils/logger';
import responseHandler, { SdcnError, StatusCode, ErrorCode } from '../utils/responseHandler';
import { AuthUserInfo } from './auth/AuthInterface';

export default class NodeControler {
  nodeService: NodeService;

  constructor(inject: { nodeService: NodeService }) {
    this.nodeService = inject.nodeService;
  }

  private static ComputeNodeHash(address: string, ownerId: string) {
    return Hasher.sha256(`${address}#${ownerId}`);
  }

  @RequireLoginAsync
  async donate(context: Context) {
    const query = context.query;
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    logger.info('userInfo', userInfo);
    const address = query.address as string;
    //TODO check address as http(s)://xxx.xx.xx
    const userId = String(userInfo.id);
    const id = await this.nodeService.getOrCreateNodeID(address, userId, true);

    await this.nodeService.addNode({ address, id, userId });
    responseHandler.success(context, undefined);
  }

  @RequireLoginAsync
  async revoke(context: Context) {
    const query = context.query;
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    const address = query.address as string;
    const nodeId = BigInt(query.nodeId as string);
    logger.info('removeNode:', address, nodeId, userInfo.id!);
    const hasOwnership = await this.nodeService.hasOwnership(BigInt(userInfo.id!), nodeId);
    if (!hasOwnership) {
      responseHandler.fail(
        context,
        new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied'),
      );
      return;
    }

    await this.nodeService.removeNode({ address });
    await this.nodeService.removeNodeFromRepo(nodeId);
    return responseHandler.success(context, undefined);
  }

  @RequireLoginAsync
  async launch(context: Context) {
    const query = context.query;
    const userInfo = context.session?.authUserInfo as AuthUserInfo;

    const address = query.address as string;
    const userId = String(userInfo.id);
    logger.info('onlineNode:', address, userInfo.id!);
    const id = await this.nodeService.getOrCreateNodeID(address, userId, false);
    if (id === '') {
      logger.info('return 400 to user');
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Bad Request'),
      );
    }
    //TODO deleted node can not online
    await this.nodeService.addNode({ address, id, userId });
    responseHandler.success(context, undefined);
  }

  @RequireLoginAsync
  async stop(context: Context) {
    const query = context.query;
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    const address = query.address as string;
    const nodeId = BigInt(query.nodeId as string);
    logger.info('offlineNode:', address, nodeId, userInfo.id!);
    const hasOwnership = await this.nodeService.hasOwnership(BigInt(userInfo.id!), nodeId);
    if (!hasOwnership) {
      responseHandler.fail(
        context,
        new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied'),
      );
      return;
    }

    this.nodeService.removeNode({ address });
    this.nodeService.offlineNode(nodeId);
    responseHandler.success(context, undefined);
  }

  @RequireLoginAsync
  async myNodes(context: Context) {
    console.log('ff');
  }

  async hallOfHonor(context: Context) {
    console.log('ff');
  }

  router() {
    const router = new Router({ prefix: '/node' });
    router.get('/donate', this.donate.bind(this));
    router.get('/revoke', this.revoke.bind(this));
    router.get('/launch', this.launch.bind(this));
    router.get('/stop', this.stop.bind(this));
    router.get('/mynodes', this.myNodes.bind(this));
    return router;
  }
}
