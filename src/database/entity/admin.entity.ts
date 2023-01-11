import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@root/Core';
import { classToPlain, plainToClass } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { promisify } from 'util';
import { BaseEntity } from './base.entity';
const scrypt = promisify(_scrypt);

@Entity({ name: 'admin' })
export class Admin extends BaseEntity {
  
  @IsNumber()
  @Column({type:'varchar', nullable: false})
  name: string;
  
  @IsString()
  @Column({type:'varchar', nullable: false ,length: 300})
  password: string;

  @Column({type:'varchar' , nullable:false , unique:true})
  user_name: string;

  @Column({ type: 'varchar', default: null })
  access_token: string;

  @Column({ type: 'int', default: null  })
  safeId: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.ADMIN,
  })
  role: Role;
  
  @Column({ type: 'boolean', default: false })
  isActive:boolean;

  static toEntity(DtoObject): Admin {
    const data = classToPlain(DtoObject);
    return plainToClass(Admin, data);
  }
}
