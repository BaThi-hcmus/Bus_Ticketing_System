import { IsString, IsNotEmpty, IsOptional, IsArray, IsEmail, IsBoolean } from "class-validator";

export class EditUserDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsEmail({}, { message: "Email không hợp lệ" })
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsBoolean()
    @IsOptional()
    deleted?: boolean;

    @IsArray()
    @IsOptional()
    roles?: number[];
}
