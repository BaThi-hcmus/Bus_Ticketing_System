import { IsOptional, IsString, IsArray, IsIn, IsBoolean } from "class-validator";

export class EditRoleDto {
    @IsOptional()
    @IsString({ message: 'Tên role phải là chuỗi kí tự' })
    name?: string;

    @IsOptional()
    @IsArray({ message: "Danh sách quyền phải là một mảng" })
    permissions?: number[];

    @IsOptional()
    @IsIn(['active', 'inactive'], { message: 'Trạng thái phải là active hoặc inactive' })
    status?: string;

    @IsOptional()
    @IsBoolean({ message: 'deleted phải là boolean' })
    deleted?: boolean;
}
