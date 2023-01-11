import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';

export class CreateAuthUserDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@test.com',
    required: true,
    type: 'string',
  })
  public readonly email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password',
    required: true,
    type: 'string',
  })
  public readonly password: string;
}

export class VerifyAuthUserByEmailDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@test.com',
    required: true,
    type: 'string',
  })
  public readonly email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password',
    required: true,
    type: 'string',
  })
  public readonly password: string;
}


