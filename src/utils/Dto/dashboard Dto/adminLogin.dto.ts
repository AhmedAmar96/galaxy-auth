import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class AdminLoginDto{

    @ApiProperty({example: "admin"})
    @IsString()
    user_name:string;
    
    @ApiProperty({example: "password@123"})
    @IsString()
    password:string;

}