import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@root/Core';
import { User } from '@root/Core/decorateros';
import { AuthAdmin } from '@root/Core/decorateros/auth-admin';
import { AuthSuperAdmin } from '@root/Core/decorateros/auth-super-admin';
import { AdminLoginDto } from '@root/utils/Dto/dashboard Dto/adminLogin.dto';
import { ChanegeRoleDTO } from '@root/utils/Dto/dashboard Dto/changeRole.dto';
import { CreateAdminDTO } from '@root/utils/Dto/dashboard Dto/createAdmin.dto';
import { DeleteAdminDTO } from '@root/utils/Dto/dashboard Dto/deleteAdmin.dto';
import { UpdateAdminDTO } from '@root/utils/Dto/dashboard Dto/updateAdmin.dto';
import { Connection } from 'typeorm';
import * as message from '../../utils/messages';
import { CREATE, DELETE, FETCH, UPDATE } from '../../utils/messages';
import { DahsboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('/dashboard')
export class DashboardController {
  constructor(
    private readonly _dashboardService: DahsboardService,
    private readonly connection: Connection,
  ) {}

  @Post('/login')
  @ApiOperation({ description: 'To login and return token' })
  async login(@Body() body: AdminLoginDto) {
    let result = await this._dashboardService.login(body);
    return { message: message.LOGIN_SUCCESS, result };
  }

  @Post('/createAdmin')
  @ApiOperation({
    description: 'Add new admin after add safe from payment-service',
  })
  // @AuthSuperAdmin()
  async createAdmin(@Body() body: CreateAdminDTO, @Req() req) {
    await this._dashboardService.CreateAdmin(body, req.headers.authorization);
    return { message: CREATE };
  }

  @Get('/getAdminRoles')
  @ApiOperation({
    description: 'Return all roles depending on the access of the admin login',
  })
  @AuthAdmin()
  async getAdminRoles(@User() loginData) {
    let result = [
      ...Object.values(Role).filter((k) => typeof k === 'string'),
    ];
    if (loginData.adminRole != Role.SUPERADMIN) {
      return {
        message: FETCH,
        result: result.filter((role) => role != Role.SUPERADMIN),
      };
    }
    return { message: FETCH, result };
  }

  @Get('/getAllAdmins')
  @ApiOperation({
    description: 'Return all admins',
  })
  @AuthAdmin()
  async getAllAdmins() {
    let result = await this._dashboardService.getAllAdmins();
    return { result, message: FETCH };
  }

  @Post('/updateAdmin')
  @ApiOperation({
    description: 'Edit the admin whose ID is in body',
  })
  @AuthAdmin()
  async updateAdmin(@Body() body: UpdateAdminDTO, @User() loginData) {
    await this._dashboardService.updateAdmin(body, loginData);
    return { message: UPDATE };
  }

  @Post('/changeRole')
  @ApiOperation({
    description:
      'Edit the admin_role whose ID is in body (SuperAdmin only can do this)',
  })
  @AuthSuperAdmin()
  async changeRole(@Body() body: ChanegeRoleDTO) {
    await this._dashboardService.changeRole(body);
    return { message: UPDATE };
  }

  @Post('/deleteAdmin')
  @ApiOperation({
    description: 'Delete the admin whose ID is in body',
  })
  @AuthAdmin()
  async deleteAdmin(
    @Body() body: DeleteAdminDTO,
    @User() loginData,
    @Req() req,
  ) {
    await this._dashboardService.deleteAdmin(
      body,
      loginData,
      req.headers.authorization,
    );
    return { message: DELETE };
  }
}
