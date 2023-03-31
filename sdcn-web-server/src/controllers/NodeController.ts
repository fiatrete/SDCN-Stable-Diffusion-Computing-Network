import { Context } from 'koa';
import Router from 'koa-router';
import { RequireLoginAsync } from '../annotators/RequireLogin';
import NodeService from '../services/NodeService';
import { UserService } from '../services';
import Hasher from '../utils/Hasher';
import logger from '../utils/logger';
import responseHandler, { SdcnError, StatusCode, ErrorCode } from '../utils/responseHandler';
import { AuthUserInfo } from './auth/AuthInterface';
import { User } from '../models';

export default class NodeControler {
  nodeService: NodeService;
  userService: UserService;

  constructor(inject: { nodeService: NodeService; userService: UserService }) {
    this.nodeService = inject.nodeService;
    this.userService = inject.userService;
  }

  private static ComputeNodeHash(address: string, ownerId: string) {
    return Hasher.sha256(`${address}#${ownerId}`);
  }

  @RequireLoginAsync
  async donate(context: Context) {
    const body = context.request.body;
    if (body.worker === undefined) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument'),
      );
    }
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    logger.info('userInfo', userInfo);
    const address = body.worker;
    //TODO check address as http(s)://xxx.xx.xx
    const userId = String(userInfo.id);
    const node = await this.nodeService.getOrCreateNode(address, userId, true);

    if (node === undefined) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument'),
      );
    }
    await this.nodeService.addNode({ address, nodeId: String(node?.nodeSeq), userId });
    await this.nodeService.donateNode(node?.nodeSeq);
    responseHandler.success(context, { nodeId: node?.nodeSeq, status: node?.status });
  }

  async checkParams(context: Context, userInfo: AuthUserInfo): Promise<[string, number]> {
    const body = context.request.body;
    const nodeId = body.nodeId;
    if (nodeId === undefined) {
      return ['', 1];
    }
    const hasOwnership = await this.nodeService.hasOwnership(BigInt(userInfo.id!), nodeId);
    if (!hasOwnership) {
      return ['', 2];
    }
    const worker = await this.nodeService.getWorkerByNodeId(nodeId);
    if (worker === '') {
      return ['', 1];
    }
    return [worker, 0];
  }

  @RequireLoginAsync
  async revoke(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    const [worker, status] = await this.checkParams(context, userInfo);
    if (status === 1) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument'),
      );
    }
    if (status === 2) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied'),
      );
    }
    const nodeId = context.request.body.nodeId;
    logger.info('removeNode:', worker, nodeId, userInfo.id!);
    const node = await this.nodeService.getNodeByNodeId(nodeId);
    logger.info(node);
    if (node?.deleted === 0 && node?.status === 1) {
      await this.nodeService.removeNode({ address: worker });
    }
    await this.nodeService.removeNodeFromRepo(nodeId);
    return responseHandler.success(context, { nodeId: nodeId });
  }

  @RequireLoginAsync
  async launch(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    const [worker, status] = await this.checkParams(context, userInfo);
    if (status === 1) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument'),
      );
    }
    if (status === 2) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied'),
      );
    }

    const userId = String(userInfo.id);
    logger.info('launch:', worker, userInfo.id!);
    const node = await this.nodeService.getOrCreateNode(worker, userId, false);
    logger.info('launch', node);

    if (node === undefined) {
      logger.info('return 400 to user');
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Bad Request'),
      );
    }
    if (node.deleted === 1) {
      logger.info('node is deleted, can not be launch');
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Node is already deleted'),
      );
    }
    const nodeId = context.request.body.nodeId;
    await this.nodeService.addNode({ address: worker, nodeId: String(node.nodeSeq), userId });
    await this.nodeService.onlineNode(node.nodeSeq);

    return responseHandler.success(context, { nodeId: nodeId, status: node.status });
  }

  @RequireLoginAsync
  async stop(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;

    const [worker, status] = await this.checkParams(context, userInfo);
    if (status === 1) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument'),
      );
    }
    if (status === 2) {
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied'),
      );
    }

    const nodeId = context.request.body.nodeId;
    logger.info('stop:', worker, nodeId, userInfo.id!);

    const node = await this.nodeService.getNodeByNodeId(nodeId);
    if (node === undefined) {
      logger.info('return 400 to user');
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Bad Request'),
      );
    }
    logger.info(node);
    if (node.deleted === 1) {
      logger.info('node is deleted, can not be launch');
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Node is already deleted'),
      );
    }
    if (node?.deleted === 0 && node?.status === 1) {
      await this.nodeService.removeNode({ address: worker });
      await this.nodeService.offlineNode(nodeId);
    }
    return responseHandler.success(context, { nodeId: nodeId, status: node.status });
  }

  @RequireLoginAsync
  async mine(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    if (userInfo.id === undefined) {
      logger.info('userId is undefined');
      return responseHandler.fail(
        context,
        new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Bad Request'),
      );
    }
    const nodeList = await this.nodeService.getNodeListbyAccountId(userInfo.id);
    const result: { nodeId: bigint; status: number }[] = [];
    nodeList.forEach((node) => {
      const item = { nodeId: node.nodeSeq, status: node.status };
      result.push(item);
    });
    return responseHandler.success(context, {
      items: result,
      page: 1,
      pageSize: result.length,
      totolPages: 1,
      totalSize: result.length,
    });
  }

  async node(context: Context) {
    const allNodeList = await this.nodeService.getAllUndeletedNodeList();
    logger.info('allNodeList', allNodeList);
    const promises = allNodeList.map(async (node) => {
      logger.info(node, node.accountId);
      const user = await this.userService.getUserInfo(node.accountId);
      if (user === undefined) {
        return;
      }
      const userInfo = user as unknown as User;
      const accountInfo = { nickname: userInfo?.nickname, avatarImgUrl: userInfo?.avatarImg, email: userInfo?.email };
      logger.info(accountInfo);
      const item = { nodeId: node.nodeSeq, account: accountInfo, status: node.status };
      return item;
    });
    const result = await Promise.all(promises);
    logger.info('out-result', result);
    return responseHandler.success(context, {
      items: result,
      page: 1,
      pageSize: result.length,
      totolPages: 1,
      totalSize: result.length,
    });
  }

  router() {
    const router = new Router({ prefix: '/node' });
    router.post('/donate', this.donate.bind(this));
    router.post('/revoke', this.revoke.bind(this));
    router.post('/launch', this.launch.bind(this));
    router.post('/stop', this.stop.bind(this));
    router.get('/mine', this.mine.bind(this));
    router.get('/', this.node.bind(this));
    return router;
  }
}
