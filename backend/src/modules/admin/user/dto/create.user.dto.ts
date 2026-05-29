import { IsNotEmpty, IsString, IsEmail, IsNumber, IsArray, IsInt } from 'class-validator'

export class CreateUserDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @IsString({ message: 'Tên phải là chuỗi kí tự' })
    fullName: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsString({ message: 'Email phải là chuỗi kí tự' })
    @IsEmail({}, { message: 'Email phải đúng định dạng' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @IsString({ message: 'Mật khẩu phải là chuỗi kí tự' })
    password: string;

    @IsNotEmpty({ message: 'Role không được để trống' })
    @IsArray({ message: 'Role phải là một mảng' })
    @IsInt({
        each: true,
        message: 'Các phần tử của mảng roles phải là số nguyên'
    })
    roles: number[];
}