import { Context } from 'koa';

function RequireLoginAsync(target: unknown, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: unknown[]) {
    const context = args[0] as Context;
    if (!context.session || !context.session.authUserInfo) {
      context.status = 401;
      context.body = 'Authorization Required';
      return;
    }
    return await originalMethod.apply(this, args);
  };
  return descriptor;
}

function RequireLogin(target: unknown, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    const context = args[0] as Context;
    if (!context.session || !context.session.authUserInfo) {
      context.status = 401;
      context.body = 'Authorization Required';
      return;
    }
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

export { RequireLoginAsync, RequireLogin };
