import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: 'Tên quyền không được để trống' })
    @IsString({ message: 'Tên quyền phải là 1 chuỗi kí tự' })
    name: string;

    @IsNotEmpty({ message: 'Tên hiển thị của quyền không được để trống' })
    @IsString({ message: 'Tên hiển thị của quyền phải là 1 chuỗi kí tự' })
    displayName: string;
}