import { Context } from 'koa';
import Router from 'koa-router';
import { RequireLoginAsync } from '../annotators/RequireLogin';
import NodeService from '../services/NodeService';
import { UserService } from '../services';
import logger from '../utils/logger';
import responseHandler, { SdcnError, StatusCode, ErrorCode } from '../utils/responseHandler';
import { AuthUserInfo } from './auth/AuthInterface';
import { User } from '../models';
import Joi, { number } from 'joi';
import { ResponseSdcnErrorOnThrowAsync } from '../annotators/ResponseSdcnErrorOnThrow';

export default class NodeControler {
  nodeService: NodeService;
  userService: UserService;

  constructor(inject: { nodeService: NodeService; userService: UserService }) {
    this.nodeService = inject.nodeService;
    this.userService = inject.userService;
  }

  @ResponseSdcnErrorOnThrowAsync
  @RequireLoginAsync
  async donate(context: Context) {
    const body = context.request.body;
    if (body.worker === undefined) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument');
    }
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    logger.debug('userInfo', userInfo);
    const address = body.worker;
    //TODO check address as http(s)://xxx.xx.xx
    const userId = String(userInfo.id);
    const node = await this.nodeService.getOrCreateNode(address, userId, true);
    logger.debug('donate', node, node?.nodeSeq);
    if (node === undefined || node.nodeSeq === undefined) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument');
    }
    await this.nodeService.addNode({ address, nodeId: String(node?.nodeSeq), userId });
    await this.nodeService.donateNode(node?.nodeSeq);
    responseHandler.success(context, { nodeId: node?.nodeSeq, status: node?.status });
  }

  private async checkParams(context: Context, userInfo: AuthUserInfo): Promise<string> {
    const body = context.request.body;
    const nodeId = body.nodeId;
    logger.debug('nodeId', nodeId, userInfo);
    if (nodeId === undefined) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument');
    }
    const hasOwnership = await this.nodeService.hasOwnership(BigInt(userInfo.id!), nodeId);
    if (!hasOwnership) {
      throw new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied');
    }
    const worker = await this.nodeService.getWorkerByNodeId(nodeId);
    if (worker === '') {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid Argument');
    }
    return worker;
  }

  @ResponseSdcnErrorOnThrowAsync
  @RequireLoginAsync
  async revoke(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    const worker = await this.checkParams(context, userInfo);

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

  @ResponseSdcnErrorOnThrowAsync
  @RequireLoginAsync
  async launch(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    const worker = await this.checkParams(context, userInfo);

    const userId = String(userInfo.id);
    logger.debug('launch:', worker, userInfo.id!);
    const node = await this.nodeService.getOrCreateNode(worker, userId, false);
    logger.debug('launch', node);

    if (node === undefined) {
      logger.debug('return 400 to user');
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Bad Request');
    }
    if (node.deleted === 1) {
      logger.debug('node is deleted, can not be launch');
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Node is already deleted');
    }
    const nodeId = context.request.body.nodeId;
    await this.nodeService.addNode({ address: worker, nodeId: String(node.nodeSeq), userId });
    await this.nodeService.onlineNode(node.nodeSeq);

    return responseHandler.success(context, { nodeId: nodeId, status: node.status });
  }

  @ResponseSdcnErrorOnThrowAsync
  @RequireLoginAsync
  async stop(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;

    const worker = await this.checkParams(context, userInfo);
    const nodeId = context.request.body.nodeId;
    logger.debug('stop:', worker, nodeId, userInfo.id!);

    const node = await this.nodeService.getNodeByNodeId(nodeId);
    if (node === undefined) {
      logger.debug('return 400 to user');
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Bad Request');
    }
    logger.debug(node);
    if (node.deleted === 1) {
      logger.debug('node is deleted, can not be launch');
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Node is already deleted');
    }
    if (node?.deleted === 0 && node?.status === 1) {
      await this.nodeService.removeNode({ address: worker });
      await this.nodeService.offlineNode(nodeId);
    }
    return responseHandler.success(context, { nodeId: nodeId, status: node.status });
  }

  @ResponseSdcnErrorOnThrowAsync
  @RequireLoginAsync
  async mine(context: Context) {
    const schema = Joi.object({
      pageNo: Joi.number().integer().min(1).required(),
      pageSize: Joi.number().integer().min(1).max(100).required(),
    });
    const { value, error } = schema.validate(context.query);
    if (error) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, error.message);
    }
    const { pageNo, pageSize } = value;
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    if (userInfo.id === undefined) {
      logger.debug('userId is undefined');
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Bad Request');
    }

    const totalSize = await this.nodeService.getNodeCountByAcccountId(userInfo.id);
    if (totalSize === 0) {
      return responseHandler.success(context, {
        items: [],
        pageNo: pageNo,
        pageSize: pageNo,
        totolPages: 0,
        totalSize: 0,
      });
    }
    const nodeList = await this.nodeService.getNodeListbyAccountIdPaged(userInfo.id, pageNo, pageSize);

    const promises = nodeList.map(async (node) => {
      const taskCount = await this.nodeService.getNodeTaskCount(node.nodeSeq);
      const item = {
        nodeId: node.nodeSeq,
        status: node.status,
        taskHandlerCount: taskCount,
      };
      return item;
    });
    const result = await Promise.all(promises);
    return responseHandler.success(context, {
      items: result,
      pageNo: pageNo,
      pageSize: pageSize,
      totolPages: Math.ceil(Number(totalSize / pageSize)),
      totalSize: totalSize,
    });
  }

  @ResponseSdcnErrorOnThrowAsync
  async node(context: Context) {
    const schema = Joi.object({
      type: Joi.number().required(),
      pageNo: Joi.number().integer().min(1).required(),
      pageSize: Joi.number().integer().min(1).max(100).required(),
    });
    const { value, error } = schema.validate(context.query);
    if (error) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, error.message);
    }
    const { type, pageNo, pageSize } = value;
    const totalSize = await this.nodeService.getNodeCountByType(type);
    if (totalSize === 0) {
      return responseHandler.success(context, {
        items: [],
        pageNo: pageNo,
        pageSize: pageNo,
        totolPages: 0,
        totalSize: 0,
      });
    }
    const nodeList = await this.nodeService.getNodeListByType(type, pageNo, pageSize);
    const promises = nodeList.map(async (node) => {
      const user = await this.userService.getUserInfo(node.accountId);
      if (user === undefined) {
        return;
      }
      const taskCount = await this.nodeService.getNodeTaskCount(node.nodeSeq);
      const userInfo = user as unknown as User;
      const accountInfo = { nickname: userInfo?.nickname, avatarImgUrl: userInfo?.avatarImg, email: userInfo?.email };
      const item = {
        nodeId: node.nodeSeq,
        account: accountInfo,
        status: node.status,
        taskHandlerCount: taskCount,
      };
      return item;
    });

    const result = await Promise.all(promises);
    // logger.info('out-result', result);
    return responseHandler.success(context, {
      items: result,
      pageNo: pageNo,
      pageSize: pageSize,
      totolPages: Math.ceil(Number(totalSize / pageSize)),
      totalSize: totalSize,
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
