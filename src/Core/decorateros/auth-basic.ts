import { applyDecorators, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBasicAuth, ApiBearerAuth } from "@nestjs/swagger";
import { AdminTokenInterceptor } from "../interceptors/admin-token.interceptor";

export function AuthBasic() {
  return applyDecorators(
    ApiBasicAuth('basic-auth'),
    UseGuards(AuthGuard('Basic'))
  )
}