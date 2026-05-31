import { IsOptional, IsString, IsIn, IsBoolean, IsInt, Min } from 'class-validator';

export class EditPermissionDto {
    @IsOptional()
    @IsString({ message: 'Tên quyền phải là chuỗi ký tự' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Tên hiển thị của quyền phải là 1 chuỗi kí tự' })
    displayName?: string;

    @IsOptional()
    @IsInt({ message: 'Vui lòng chọn nhóm quyền hợp lệ' })
    @Min(1, { message: 'Vui lòng chọn nhóm quyền hợp lệ' })
    categoryPermissionId?: number;

    @IsOptional()
    @IsIn(['active', 'inactive'], { message: 'Trạng thái phải là active hoặc inactive' })
    status?: string;

    @IsOptional()
    @IsBoolean({ message: 'deleted phải là boolean' })
    deleted?: boolean;
}
