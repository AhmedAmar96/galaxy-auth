import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Role } from '../../../Core';

export const letterRegex = new RegExp('^(?=.*[a-zA-Z])'),
  specialcharRegex = new RegExp('^(?=.*[!@#\\$%\\^&\\*])'),
  digitRegex = new RegExp('^(?=.*[0-9])');
export class CreateAdminDTO {
  @ApiProperty({ required: true, type: 'string', example: "admin" })
  @IsNotEmpty()
  user_name: string;

  @ApiProperty({ required: true, type: 'string', example: "admin" })
  @IsString()
  name: string;

  @ApiProperty({ required: true, format: 'password', example: "password@123" })
  @IsString({ message: 'Password is required' })
  @Length(8, 50, {
    message: 'Weak Password! Please make sure it 8 character long or more',
  })
  @Matches(letterRegex, {
    message: 'Weak Password! Please make sure it contains at least one letter',
  })
  @Matches(specialcharRegex, {
    message:
      'Weak Password! Please make sure it contains at least one special character',
  })
  @Matches(digitRegex, {
    message: 'Weak Password! Please provid at least one digit',
  })
  password: string;

  @ApiProperty({example: "admin"})
  @IsString()
  createdBy: string;

  @ApiProperty({example: Role.ADMIN})
  @IsEnum(Role)
  role: Role;

  @ApiProperty({example: 1})
  @IsNumber()
  @IsOptional()
  safeId: number;
}
