import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateStationDto {
    @IsNotEmpty({ message: 'Tên trạm không được để trống' })
    @IsString({ message: 'Tên trạm phải là chuỗi ký tự' })
    name: string;

    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
    address: string;

    @IsNumber({}, { message: 'Vĩ độ phải là số' })
    @Min(-90, { message: 'Vĩ độ không hợp lệ' })
    @Max(90, { message: 'Vĩ độ không hợp lệ' })
    lat: number;

    @IsNumber({}, { message: 'Kinh độ phải là số' })
    @Min(-180, { message: 'Kinh độ không hợp lệ' })
    @Max(180, { message: 'Kinh độ không hợp lệ' })
    lng: number;
}
