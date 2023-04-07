import { Context } from 'koa';
import logger from '../utils/logger';
import responseHandler, { ErrorCode, SdcnError, StatusCode } from '../utils/responseHandler';

function ResponseSdcnErrorOnThrowAsync(target: unknown, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: unknown[]) {
    const context = args[0] as Context;
    try {
      return await originalMethod.apply(this, args);
    } catch (error: unknown) {
      if (error instanceof SdcnError) {
        responseHandler.fail(context, error as SdcnError);
        return;
      }
      logger.error(`An unkown error occured during ${methodName}: `, error);
    }
    responseHandler.fail(context, new SdcnError(StatusCode.InternalServerError, ErrorCode.Unknown, 'Unkown error'));
  };
  return descriptor;
}

export { ResponseSdcnErrorOnThrowAsync };
