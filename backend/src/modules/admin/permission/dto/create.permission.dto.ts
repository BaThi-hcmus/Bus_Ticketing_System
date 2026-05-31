import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: 'Tên quyền không được để trống' })
    @IsString({ message: 'Tên quyền phải là 1 chuỗi kí tự' })
    name: string;

    @IsNotEmpty({ message: 'Tên hiển thị của quyền không được để trống' })
    @IsString({ message: 'Tên hiển thị của quyền phải là 1 chuỗi kí tự' })
    displayName: string;

    @IsNotEmpty({ message: 'Vui lòng chọn nhóm quyền' })
    @IsInt({ message: 'Vui lòng chọn nhóm quyền hợp lệ' })
    @Min(1, { message: 'Vui lòng chọn nhóm quyền hợp lệ' })
    categoryPermissionId: number;
}