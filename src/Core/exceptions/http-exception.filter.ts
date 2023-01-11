import {
  ArgumentsHost,
  Catch, 
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
        
    response.status(status).json({
      status: false,
      message: (exception['response'] && exception['response']['message'])
        ? exception['response']['message'].toString().substring(exception['response']['message'][0].lastIndexOf(".") + 1).split(',')[0]
        : exception['message'].substring(exception['message'][0].lastIndexOf(".") + 1).split(',')[0] ,
      statusCode: status,
      data: null,
    });
  }
}
