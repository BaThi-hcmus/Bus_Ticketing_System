import {
    IsNotEmpty,
    IsString,
    IsInt,
    Min,
    Max,
    IsIn,
} from 'class-validator';

export class CreateBusDto {
    @IsNotEmpty({ message: 'Biển số xe không được để trống' })
    @IsString({ message: 'Biển số xe phải là chuỗi ký tự' })
    licensePlate: string;

    @IsNotEmpty({ message: 'Loại xe không được để trống' })
    @IsString({ message: 'Loại xe phải là chuỗi ký tự' })
    type: string;

    @IsInt({ message: 'Tổng số ghế phải là số nguyên dương' })
    @Min(1, { message: 'Tổng số ghế phải lớn hơn 0' })
    @Max(80, { message: 'Tổng số ghế không hợp lệ' })
    totalSeats: number;

    @IsNotEmpty({ message: 'Hãng xe không được để trống' })
    @IsString({ message: 'Hãng xe phải là chuỗi ký tự' })
    model: string;
}
