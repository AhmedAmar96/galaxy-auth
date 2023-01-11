import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DeleteAdminDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class DeleteMemberDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class NotUseMemberDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class ActiveMemberDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  itemId: number;

  @ApiProperty({ example: 6500 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ required: true, type: 'string', example: '1' })
  @IsString()
  paymentId: string;

  @ApiProperty({ required: true, type: 'string', example: '01-01-2022' })
  @IsString()
  paymentDate: string;
}
export class NewMemberBillDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  memberId: number;
}
