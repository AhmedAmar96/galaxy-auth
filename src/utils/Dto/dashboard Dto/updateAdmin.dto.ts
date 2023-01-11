import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length, Matches } from 'class-validator';

export const letterRegex = new RegExp('^(?=.*[a-zA-Z])'),
  specialcharRegex = new RegExp('^(?=.*[!@#\\$%\\^&\\*])'),
  digitRegex = new RegExp('^(?=.*[0-9])');
export class UpdateAdminDTO {
  @ApiProperty({ required: true, example: 'new_password@123' })
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

  @ApiProperty({ example: 'admin' })
  @IsString()
  lastChangedBy: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}
