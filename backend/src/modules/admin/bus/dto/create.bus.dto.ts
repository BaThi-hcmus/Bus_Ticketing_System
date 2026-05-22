import {
    IsNotEmpty,
    IsString,
    IsNumber, 
    Min,
    Max,
    Length,
    IsIn,
    IsInt
} from 'class-validator'

export class CreateBusDto {
    @IsNotEmpty({message: 'Biển số xe không được để trống'})
    @IsString({message: 'Biển số xe phải là chuỗi kí tự'})
    licensePlate: string;

    @IsString({message: 'Loại xe phải là chuỗi kí tự'})
    @IsIn(['Giường nằm', 'Ghế ngồi', 'Limousine'], {
        message: 'Loại xe phải thuộc: "Giường nằm", "Ghế ngồi", "Limousine"'
    })
    type: string;

    @IsInt({message: 'Tổng số ghế phải là một số nguyên dương'})
    totalSeats: number;

    @IsString({message: 'Hãng xe phải là chuỗi kí tự'})
    model: string;
}