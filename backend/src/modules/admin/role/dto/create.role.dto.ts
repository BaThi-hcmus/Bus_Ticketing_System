import { IsNotEmpty, IsString, IsArray } from "class-validator";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'Tên role không được để trống' })
    @IsString({ message: 'Tên role phải là chuỗi kí tự' })
    name: string;

    @IsArray({ message: "danh sách quyền phải là một mảng" })
    permissions?: number[];
}