import { applyDecorators, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminTokenInterceptor } from "../interceptors/admin-token.interceptor";

export function AuthAdmin() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    UseInterceptors(AdminTokenInterceptor),
    UseGuards(AuthGuard('admin'))
  )
} 