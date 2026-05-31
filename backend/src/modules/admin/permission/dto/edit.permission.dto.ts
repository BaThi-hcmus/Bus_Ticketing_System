import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';

export class EditPermissionDto {
    @IsOptional()
    @IsString({ message: 'Tên quyền phải là chuỗi ký tự' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Tên hiển thị của quyền phải là 1 chuỗi kí tự' })
    displayName: string;

    @IsOptional()
    @IsIn(['active', 'inactive'], { message: 'Trạng thái phải là active hoặc inactive' })
    status?: string;

    @IsOptional()
    @IsBoolean({ message: 'deleted phải là boolean' })
    deleted?: boolean;
}
