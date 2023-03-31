import { Context, Next } from 'koa';
import logger from './logger';

export enum StatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export enum ErrorCode {
  Unknown = -1,
  Success = 0,
  PermissionDenied = 1000,
  ResourceUnavailable = 2000,
  InvalidArgument = 3000,
}

export class SdcnError extends Error {
  statusCode: StatusCode;
  code: ErrorCode;
  message: string;
  constructor(statusCode: StatusCode, code: ErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
  }
}

export async function errorHandler(context: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    logger.error(error);

    if (error instanceof SdcnError) {
      context.statusCode = error.statusCode;
      context.body = {
        code: error.code,
        message: error.message,
      };
    } else {
      context.statusCode = 500;
      context.body = {
        code: 500,
        message: `${error}`,
      };
    }
  }
}

function success(context: Context, data: any) {
  context.status = StatusCode.Success;
  context.body = {
    code: 0,
    data,
    message: 'success',
  };
}

function fail(context: Context, error: SdcnError) {
  context.status = error.statusCode;
  context.body = {
    code: error.code,
    message: error.message,
  };
}

export default { success, fail };
