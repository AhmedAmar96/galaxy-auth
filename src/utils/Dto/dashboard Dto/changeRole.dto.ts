import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Role } from '../../../Core';

export class ChanegeRoleDTO {
  @ApiProperty({ example: Role.SUPERADMIN })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'admin' })
  @IsString()
  lastChangedBy: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}
