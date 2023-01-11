import {
    CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException
  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '@root/database/entity/admin.entity';
import { Repository } from 'typeorm';
import { Role } from '../enums';
  
  @Injectable()
  export class SuperAdminInterceptor implements NestInterceptor {
    constructor() {}
    async intercept(context: ExecutionContext, handler: CallHandler) {
        let role = context.switchToHttp().getRequest().user.adminRole;
        if(role != Role.SUPERADMIN)
            throw new UnauthorizedException(
            'ليس لديك صلاحيه للوصول لهذه الصفحه',
            );
  
      return handler.handle();
    }
  }
  