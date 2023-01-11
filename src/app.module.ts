import { RedisModule } from '@liaoliaots/nestjs-redis';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-rollbar';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { ResponseTransformInterceptor } from './Core/interceptors/respone-transform.interceptor';
import LogsMiddleware from './Core/loggers/logs.middleware';
import { Member } from './database/entity/member.entity';
import { DashboardModule } from './domains/dashboard/dashboard.module';
import { RedisService } from './utils/redis/redis.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: process.env.RABBITMQ_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    PrometheusModule.register(),
    RedisModule.forRoot(configService.getRedisConfig()),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([Member]),
    HttpModule.register(configService.getAxiosConfig()),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 70,
    }),

    DashboardModule,

    LoggerModule.forRoot({
      accessToken: process.env.ROLLBAR_TOKEN,
      environment: process.env.MODE,
      captureUncaught: true,
      captureUnhandledRejections: true,
      logLevel: 'error',
    }),

    // ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    },
    RedisService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // CheckPrintCardCronJob,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
