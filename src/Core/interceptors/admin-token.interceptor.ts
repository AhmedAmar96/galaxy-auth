import {
  CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException
} from '@nestjs/common';
import { LOGOUT_SUCCESS } from '@root/utils/messages';
import { RedisService } from '../../utils/redis/redis.service';

@Injectable()
export class AdminTokenInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService) {}
  async intercept(context: ExecutionContext, handler: CallHandler) {
    let reqToken = context
      .switchToHttp()
      .getRequest()
      .headers.authorization.split('Bearer ')[1];
      console.log('userId :',context.switchToHttp().getRequest().user.userId);
      
    let redisToken = await this.redisService.GetAccessToken(
      'Admin'+context.switchToHttp().getRequest().user.userId,
    );
    console.log('REQ TOKEN' + reqToken);
    console.log('REDIS TOKEN' + redisToken);
    if (reqToken != redisToken)
      throw new UnauthorizedException(
        LOGOUT_SUCCESS,
      );

    return handler.handle();
  }
}
