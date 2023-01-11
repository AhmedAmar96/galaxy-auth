import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from '@root/Core/AWS/aws-s3';
import { Encript } from '@root/Core/Encription/encription';
import { getErrorMessage } from '@root/Core/exceptions/error-filter';
import { Admin } from '@root/database/entity/admin.entity';
import { Member } from '@root/database/entity/member.entity';
import { AdminLoginDto } from '@root/utils/Dto/dashboard Dto/adminLogin.dto';
import { ChanegeRoleDTO } from '@root/utils/Dto/dashboard Dto/changeRole.dto';
import { CreateAdminDTO } from '@root/utils/Dto/dashboard Dto/createAdmin.dto';
import {
  ActiveMemberDTO,
  DeleteAdminDTO,
  DeleteMemberDTO,
} from '@root/utils/Dto/dashboard Dto/deleteAdmin.dto';

import { UpdateAdminDTO } from '@root/utils/Dto/dashboard Dto/updateAdmin.dto';
import {
  ALREADY_EXISTS,
  INTERNAL_SERVER_ERROR,
  INVALID_CREDENTIALS,
  NOTACCESS,
  NOTFOUND,
} from '@root/utils/messages';
import * as moment from 'moment';
import { RollbarLogger } from 'nestjs-rollbar';
import xlsx from 'node-xlsx';
import { firstValueFrom, map } from 'rxjs';
import {
  createQueryBuilder,
  EntityManager,
  getConnection,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { RedisService } from '../../utils/redis/redis.service';

const servicesURL = process.env.SERVICES_MICROSERVICE;

export class DahsboardService {
  s3Service = new S3Service(this.rollbarLogger);

  constructor(
    private readonly httpservice: HttpService,
    private readonly _jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly rollbarLogger: RollbarLogger,
    @InjectRepository(Admin) private _adminRepo: Repository<Admin>,
  ) {}

  async login(body: AdminLoginDto) {
    try {
      let admin = await this.validateUser(body.user_name, body.password);
      const password = process.env.TOKEN_KEY;
      const iv = process.env.TOKEN_IV;

      const payload = {
        sub: Encript(admin.id + '', password, iv),
        name: Encript(admin.name, password, iv),
        userType: Encript('admin', password, iv),
        adminRole: Encript(admin.role, password, iv),
      };

      const access_token = this._jwtService.sign(payload);
      admin.access_token = access_token;
      // await this._adminRepo.update(admin.id, admin)
      await this._adminRepo.save(admin);
      await this.redisService.SaveAccessToken(access_token, 'Admin' + admin.id);
      return {
        access_token,
        Name: admin.name,
        safeId: admin.safeId,
        adminId: admin.id,
        role: admin.role,
      };
    } catch (e) {
      this.rollbarLogger.error(
        `${INTERNAL_SERVER_ERROR} : ${getErrorMessage(e)}`,
      );

      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async validateUser(user_name: string, password: string): Promise<Admin> {
    const admin = await this._adminRepo.findOne({
      where: { user_name, isActive: true },
    });
    if (!admin) throw new BadRequestException(INVALID_CREDENTIALS);
    const validPassword = await Member.validatePassword(
      password,
      admin.password,
    );
    if (admin && validPassword) {
      // const { password, ...result } = admin;
      return admin;
    } else {
      throw new BadRequestException(INVALID_CREDENTIALS);
    }
  }

  async CreateAdmin(body: CreateAdminDTO, token) {
    try {
      // console.log(body.safeId);

      let user_name = await this.find({ user_name: body.user_name });
      if (user_name) throw new BadRequestException(ALREADY_EXISTS);

      const admin = Admin.toEntity(body);
      admin.lastChangedBy = body.createdBy;
      admin.password = await Member.hashPassword(body.password);
      let result = await this.create(admin);
      if (body.safeId && body.safeId != 0) {
        let paymentURL = process.env.PAYMENT_SERVER;
        console.log(paymentURL);
        let test = await firstValueFrom(
          this.httpservice.post(
            paymentURL + 'safe/updateSafe',
            { adminId: result.id, safeId: body.safeId, adminName: result.name },
            { headers: { Authorization: token } },
          ),
        );
      }
      result.isActive = true;
      await this.update(result.id, result);
      return true;
    } catch (e) {
      console.log('ERROR::', e);
      this.rollbarLogger.error(
        `${INTERNAL_SERVER_ERROR} : ${getErrorMessage(e)}`,
      );

      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async getAllAdmins() {
    let result = await this.findAll({});
    return result;
  }

  async updateAdmin(body: UpdateAdminDTO, loginData) {
    try {
      console.log(loginData);

      let admin = await this.findOne(body.id);
      if (!admin) throw new NotFoundException(NOTFOUND + 'الحساب');
      if (
        loginData.adminRole != 'Super Admin' &&
        loginData.roles != 'Admin' &&
        body.id != loginData.userId
      )
        throw new UnauthorizedException(NOTACCESS);

      admin.lastChangedBy = body.lastChangedBy;
      admin.password = await Member.hashPassword(body.password);
      let result = await this.update(admin.id, admin);

      return true;
    } catch (e) {
      this.rollbarLogger.error(
        `${INTERNAL_SERVER_ERROR} : ${getErrorMessage(e)}`,
      );

      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async changeRole(body: ChanegeRoleDTO) {
    try {
      let admin = await this.findOne(body.id);
      if (!admin) throw new NotFoundException(NOTFOUND + 'الحساب');
      admin.lastChangedBy = body.lastChangedBy;
      admin.role = body.role;
      let result = await this.update(admin.id, admin);
      return true;
    } catch (e) {
      this.rollbarLogger.error(
        `${INTERNAL_SERVER_ERROR} : ${getErrorMessage(e)}`,
      );

      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async deleteAdmin(body: DeleteAdminDTO, loginData, token) {
    try {
      console.log('loginData ======>>>>><<<<', loginData);

      let admin = await this.findOne(body.id);
      if (!admin) throw new NotFoundException(NOTFOUND + 'الحساب');
      if (loginData.adminRole != 'Super Admin' && loginData.roles != 'Admin')
        throw new UnauthorizedException(NOTACCESS);
      if (admin.safeId != null) {
        let paymentURL = process.env.PAYMENT_SERVER;

        let test = await firstValueFrom(
          this.httpservice.post(
            paymentURL + 'safe/deleteSafe',
            { safeId: admin.safeId },
            { headers: { Authorization: token } },
          ),
        );
      }
      let result = await this.delete(body.id);
      console.log(result);

      return true;
    } catch (e) {
      this.rollbarLogger.error(
        `${INTERNAL_SERVER_ERROR} : ${getErrorMessage(e)}`,
      );

      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async create(body: Admin): Promise<Admin | null> {
    console.log(body);

    const newAdmin = await this._adminRepo.create(body);
    let result = await this._adminRepo.save(newAdmin).catch((err) => {
      console.log(err);
      throw new BadRequestException(err.detail);
    });
    return result;
  }

  async delete(id: number) {
    if (!id) {
      return null;
    }
    let result = await this._adminRepo.delete({ id });
    return result;
  }

  public async update(id: number, newValue: Admin): Promise<Admin | null> {
    const admin = await this._adminRepo.findOne({ id });
    if (!admin.id) throw new NotFoundException(NOTFOUND + 'الحساب');

    await this._adminRepo.save(newValue).catch((err) => {
      throw new BadRequestException({ message: err.detail });
    });

    return await this._adminRepo.findOne({ id });
  }

  async findOne(id: number): Promise<Admin | null> {
    try {
      if (!id) {
        return null;
      }
      const admin = await this._adminRepo.findOne({ id }).catch((err) => {
        console.log(err);
        throw new BadRequestException({ message: err });
      });
      if (admin) return admin;
      return null;
    } catch (e) {
      this.rollbarLogger.error(
        `${INTERNAL_SERVER_ERROR} : ${getErrorMessage(e)}`,
      );

      throw new HttpException(getErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async find(where: object): Promise<Admin | null> {
    if (!where) {
      return null;
    }
    const admin = await this._adminRepo.findOne({ where }).catch((err) => {
      console.log(err);
      throw new BadRequestException({ message: err });
    });
    if (admin) return admin;
    return null;
  }

  async findAll(where: object): Promise<Admin[] | null> {
    if (!where) {
      return null;
    }
    const admin = await this._adminRepo.find({ where }).catch((err) => {
      console.log(err);
      throw new BadRequestException({ message: err });
    });
    if (admin) return admin;
    return null;
  }
}
