import { applyDecorators, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AccessTokenInterceptor } from "../interceptors/access-token.interceptor";


export function AuthMember() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    UseInterceptors(AccessTokenInterceptor),
    UseGuards(AuthGuard('member'))
  )
}