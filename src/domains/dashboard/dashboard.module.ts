import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '@root/database/entity/admin.entity';
import { Member } from '@root/database/entity/member.entity';
import { RedisService } from '../../utils/redis/redis.service';
import { DashboardController } from './dashboard.controller';
import { DahsboardService } from './dashboard.service';

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
    TypeOrmModule.forFeature([Member, Admin]),
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: `${process.env.JWT_EXPIRE}` },
    }),
    PassportModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [DashboardController],
  providers: [
    DahsboardService,
    RedisService,

    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // }
  ],
  exports: [DahsboardService],
})
export class DashboardModule {}
