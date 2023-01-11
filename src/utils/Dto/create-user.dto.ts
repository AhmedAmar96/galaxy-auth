import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import * as moment from 'moment';

export const letterRegex = new RegExp('^(?=.*[a-zA-Z])'),
  specialcharRegex = new RegExp('^(?=.*[!@#\\$%\\^&\\*])'),
  digitRegex = new RegExp('^(?=.*[0-9])');
export class CreateUserDto {
  //Base

  @ApiProperty({ required: true, type: 'number', example: 1 })
  @IsNumber()
  member_code: number;

  @ApiProperty({ required: true, type: 'string', example: 'Ahmed' })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({ required: true, format: 'password', example: 'ahmed@123' })
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

  @ApiProperty({ required: true, format: 'password', example: 'ahmed@123' })
  @IsString({ message: 'Confirm Password is required' })
  confirmPassword: string;

  @ApiProperty({ required: true, type: 'string', example: 'email@gmail.com' })
  @IsString({ message: 'Email is required' })
  @IsEmail({}, { message: 'Incorrect email' })
  email: string;

  @ApiProperty({ required: true, example: 2 })
  @IsNumber()
  branchId: number;
}
export class test {
  date: string;

  constructor() {}
  static checkDate(date) {
    console.log('Home : ', date.value);
    if (moment(date.value, 'DD-MM-YYYY', true).isValid()) return date.value;
    if (!moment(date.value, 'YYYY-MM-DD', true).isValid()) return false;
    const momentVariable = moment(date.value, 'YYYY-MM-DD');
    const stringvalue = momentVariable.format('DD-MM-YYYY');
    console.log('hello: ' + stringvalue);
    if (stringvalue === 'Invalid date') return false;

    return stringvalue;
  }
}
