import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../interfaces/user.interface';

export const GetUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): Omit<User, 'password'> | string => {
    const request = ctx.switchToHttp().getRequest();
    const user: Omit<User, 'password'> = request.user;

    return data ? user?.[data] : user;
  },
);
