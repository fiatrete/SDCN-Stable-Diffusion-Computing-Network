import { Context } from 'koa';

function RequireLoginAsync(target: Object, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (context: Context, ...args: any[]) {
    if (!context.session || !context.session.authUserInfo) {
      context.status = 401;
      context.body = 'Authorization Required';
      return;
    }
    args.unshift();
    args[0] = context;
    return await originalMethod.apply(this, args);
  };
  return descriptor;
}

function RequireLogin(target: Object, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (context: Context, ...args: any[]) {
    if (!context.session || !context.session.authUserInfo) {
      context.status = 401;
      context.body = 'Authorization Required';
      return;
    }
    args.unshift();
    args[0] = context;
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

export { RequireLoginAsync, RequireLogin };
