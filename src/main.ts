import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import {
  appendIdToRequest,
  appendRequestIdToLogger,
  configMorgan,
  LoggingInterceptor,
  morganRequestLogger,
  morganResponseLogger,
  NestjsWinstonLoggerService,
  TOKEN_TYPE
} from 'nestjs-winston-logger';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import { format, transports } from 'winston';
import { AppModule } from './app.module';
import { configService } from './config/config.service';
import { HttpExceptionFilter } from './Core/exceptions/http-exception.filter';
import { createDocument } from './Core/swagger/swagger';

require('dotenv').config();

const PORT = process.env.PORT || 1000;
initializeTransactionalContext()
async function bootstrap() {
  console.log('pass',process.env.POSTGRES_PASSWORD)
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '100mb',
      extended: true,
      parameterLimit: 900000,
    }),
  );

  const globalLogger = new NestjsWinstonLoggerService({
    format: format.combine(
      format.timestamp({ format: 'isoDateTime' }),
      format.json(),
      format.colorize({ all: true }),
    ),
    transports: [
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' }),
      new transports.Console(),
    ],
  });
  app.useLogger(globalLogger);

  // append id to identify request
  app.use(appendIdToRequest);
  app.use(appendRequestIdToLogger(globalLogger));

  configMorgan.appendMorganToken('reqId', TOKEN_TYPE.Request, 'reqId');
  app.use(morganRequestLogger(globalLogger));
  app.use(morganResponseLogger(globalLogger));

  app.useGlobalInterceptors(new LoggingInterceptor(globalLogger));

  (app as any).set('etag', false);
  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });
  console.log('test',process.env.RABBITMQ_URL,process.env.RABBITMQ_QUEUE);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('/auth-service/api/v1', {
    exclude: [{ path: 'auth-service/GalaxyApp', method: RequestMethod.GET }],
  });

  if (!configService.isProduction()) {
    SwaggerModule.setup('/auth-service/docs/v1', app, createDocument(app));
  }
 
  process.on('unhandledRejection', (reason, p) => {
    // logger.error(`unhandledRejection: ${reason}`);
    throw reason;
  });

  await app.listen(PORT, () => {
    console.log(`AuthMicroservices: Running at port ${PORT}`);
  });
}
bootstrap();
