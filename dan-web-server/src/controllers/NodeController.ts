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

export default class NodeControler {
  nodeService: NodeService;
  userService: UserService;

  constructor(inject: { nodeService: NodeService; userService: UserService }) {
    this.nodeService = inject.nodeService;
    this.userService = inject.userService;
  }

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

    const nodeList = await this.nodeService.getNodeListbyAccountIdPaged(userInfo.id, pageNo, pageSize);

    return responseHandler.success(context, {
      items: nodeList,
      pageNo: pageNo,
      pageSize: pageSize,
      totolPages: Math.ceil(nodeList.length / pageSize),
      totalSize: nodeList.length,
    });
  }

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
    const result = await this.nodeService.getNodeListByType(type, pageNo, pageSize);
    return responseHandler.success(context, result);
  }

  @RequireLoginAsync
  async mineSummary(context: Context) {
    const userId = (context.session?.authUserInfo as AuthUserInfo)!.id!;
    responseHandler.success(context, await this.nodeService.summaryMyNodeInfo(userId));
  }

  router() {
    const router = new Router({ prefix: '/node' });
    router.post('/donate', this.donate.bind(this));
    router.post('/revoke', this.revoke.bind(this));
    router.post('/launch', this.launch.bind(this));
    router.post('/stop', this.stop.bind(this));
    router.get('/mine', this.mine.bind(this));
    router.get('/', this.node.bind(this));
    router.get('/mine-summary', this.mineSummary.bind(this));
    return router;
  }
}
