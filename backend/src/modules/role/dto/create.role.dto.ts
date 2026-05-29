import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'Tên quyền không được để trống' })
    @IsString({ message: 'Tên quyền phải là chuỗi kí tự' })
    name: string;

    permissions?: number[];
}