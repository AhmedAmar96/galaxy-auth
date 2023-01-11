import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AdminDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.admin;
    return data ? admin?.data : admin;
  },
);