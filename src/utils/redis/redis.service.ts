import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis() private readonly defaultRedisClient: Redis, // or // @InjectRedis(DEFAULT_REDIS_NAMESPACE) private readonly defaultRedisClient: Redis
  ) {}
  //Access_Token
  async SaveAccessToken(token: any , userId:any): Promise<string> {
    await this.defaultRedisClient.setex(
      userId,
      parseInt(process.env.JWT_EXPIRE),
      token,
    );
    return this.GetAccessToken(userId);
  }
  async GetAccessToken(userId:any): Promise<string | null> {
    const token = await this.defaultRedisClient.get(
      userId,
    );
    if (!token) {
      return null;
    }
    return token;
  }
  async removeAccessToken(userId:any):Promise<string | any>{
    await this.defaultRedisClient.del(userId+'')
    return true
  }
}
