import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryPermissionDto {
    @IsNotEmpty({ message: 'Tên danh mục quyền không được để trống' })
    @IsString({ message: 'Tên danh mục quyền phải là 1 chuỗi kí tự' })
    name: string;
}
