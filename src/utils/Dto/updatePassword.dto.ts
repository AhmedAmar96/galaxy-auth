import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { digitRegex, letterRegex, specialcharRegex } from './create-user.dto';

export class UpdatePasswordDto {
  @ApiProperty({ required: true, type: 'string', example: 'password@123' })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    required: true,
    format: 'password',
    example: 'new_password@123',
  })
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
  newPassword: string;

  @ApiProperty({ required: true, format: 'password', example: 'new_password@123' })
  @IsString({ message: 'Confirm Password is required' })
  confirmPassword: string;
}
