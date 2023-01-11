import { classToPlain, plainToClass } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Entity, Index, Unique } from 'typeorm';
import { promisify } from 'util';
import { BaseEntity } from './base.entity';
const scrypt = promisify(_scrypt);

@Entity({ name: 'members' })
export class Member extends BaseEntity {
  static async hashPassword(pass: string) {
    let salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(pass, salt, 32)) as Buffer;
    let password = salt + '.' + hash.toString('hex');
    return password;
  }
  static async validatePassword(
    password: string,
    hashedPass: string,
  ): Promise<boolean> {
    const [salt, storedHash] = hashedPass.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      return false;
    }
    return true;
  }

  static toEntity(DtoObject): Member {
    const data = classToPlain(DtoObject);
    return plainToClass(Member, data);
  }
}
