import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import * as MobileDetect from 'mobile-detect';
import { RollbarLogger } from 'nestjs-rollbar';
import { Connection } from 'typeorm';
import { S3Service } from './Core/AWS/aws-s3';
import { INSERT_EXCEL, UPLOADED } from './utils/messages';

@Controller()
export class AppController {
  s3Service = new S3Service(this.rollbarLogger);

  constructor(
    private rollbarLogger: RollbarLogger,
    private readonly connection: Connection,
  ) {}
  @SkipThrottle()
  @Get('/health')
  async health() {
    return { status: 200 };
  }
  
}
