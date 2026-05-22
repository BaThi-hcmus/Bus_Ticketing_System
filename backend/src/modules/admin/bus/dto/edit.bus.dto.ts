import {
    IsOptional,
    IsString,
    IsInt,
    IsIn,
    IsBoolean,
    Min,
    Max,
} from 'class-validator';

export class EditBusDto {
    @IsOptional()
    @IsString({ message: 'Biển số xe phải là chuỗi ký tự' })
    licensePlate?: string;

    @IsOptional()
    @IsString({ message: 'Loại xe phải là chuỗi ký tự' })
    @IsIn(['Giường nằm', 'Ghế ngồi', 'Limousine'], {
        message: 'Loại xe phải thuộc: "Giường nằm", "Ghế ngồi", "Limousine"',
    })
    type?: string;

    @IsOptional()
    @IsInt({ message: 'Tổng số ghế phải là số nguyên' })
    @Min(1, { message: 'Tổng số ghế phải lớn hơn 0' })
    @Max(80, { message: 'Tổng số ghế không hợp lệ' })
    totalSeats?: number;

    @IsOptional()
    @IsString({ message: 'Hãng xe phải là chuỗi ký tự' })
    model?: string;

    @IsOptional()
    @IsIn(['active', 'inactive'], { message: 'Trạng thái phải là active hoặc inactive' })
    status?: string;

    @IsOptional()
    @IsBoolean({ message: 'deleted phải là boolean' })
    deleted?: boolean;
}
