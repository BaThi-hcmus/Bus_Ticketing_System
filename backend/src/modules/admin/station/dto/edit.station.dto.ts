import { IsOptional, IsString, IsNumber, IsIn, IsBoolean, Min, Max } from 'class-validator';

export class EditStationDto {
    @IsOptional()
    @IsString({ message: 'Tên trạm phải là chuỗi ký tự' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
    address?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Vĩ độ phải là số' })
    @Min(-90, { message: 'Vĩ độ không hợp lệ' })
    @Max(90, { message: 'Vĩ độ không hợp lệ' })
    lat?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Kinh độ phải là số' })
    @Min(-180, { message: 'Kinh độ không hợp lệ' })
    @Max(180, { message: 'Kinh độ không hợp lệ' })
    lng?: number;

    @IsOptional()
    @IsIn(['active', 'inactive'], { message: 'Trạng thái phải là active hoặc inactive' })
    status?: string;

    @IsOptional()
    @IsBoolean({ message: 'deleted phải là boolean' })
    deleted?: boolean;
}
