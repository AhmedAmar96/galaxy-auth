import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { SuperAdminInterceptor } from "../interceptors/super-admin.interceptor";
import { AuthAdmin } from "./auth-admin";

export function AuthSuperAdmin() {
  return applyDecorators(
    AuthAdmin(),
    UseInterceptors(SuperAdminInterceptor)
  ) 
}