import Router from 'koa-router';
import responseHandler, { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';
import { Context } from 'koa';
import logger from '../utils/logger';
import { HonorService } from '../services';
import { RequireLoginAsync } from '../annotators/RequireLogin';
import { AuthUserInfo } from './auth/AuthInterface';

export default class WalletController {
  private honorService: HonorService;
  constructor(inject: { honorService: HonorService }) {
    this.honorService = inject.honorService;
  }

  @RequireLoginAsync
  async transferHonor(context: Context) {
    const userInfo = context.session?.authUserInfo as AuthUserInfo;
    logger.debug('userInfo', userInfo);
    if (userInfo.id === undefined) {
      throw new SdcnError(StatusCode.Forbidden, ErrorCode.PermissionDenied, 'Permission Denied');
    }
    const currentUserId = userInfo.id;

    const { userId, amount } = context.request.body;
    await this.honorService.transferHonor(currentUserId, userId, amount);
    responseHandler.success(context, { success: true });
  }

  async presentHonor(context: Context) {
    const { userId, amount } = context.request.body;
    await this.honorService.mintHonorBySys(userId, amount);
    responseHandler.success(context, { success: true });
  }

  router() {
    const router = new Router({ prefix: '/wallet' });
    router.post('/transfer-honor', this.transferHonor.bind(this));
    router.post('/present-honor', this.presentHonor.bind(this));
    return router;
  }
}
