import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    Min,
    ValidateNested,
    IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRouteDto {
    @IsNotEmpty({message: 'Tên tuyến đường không được để trống'})
    @IsString({message: 'Tên tuyến đường phải là chuỗi kí tự'})
    name: string;

    @IsNotEmpty({ message: 'Id điểm đi không được để trống' })
    @IsInt({ message: 'Id điểm đi phải là số nguyên' })
    departureStationId: number;

    @IsNotEmpty({ message: 'Id điểm đến không được để trống' })
    @IsInt({ message: 'Id điểm đến phải là chuỗi ký tự' })
    destinationStationId: number;

    @IsNumber({}, { message: 'Khoảng cách phải là số' })
    @Min(0, { message: 'Khoảng cách không được âm' })
    distanceKm: number;

    @IsNumber({}, { message: 'Thời gian dự kiến phải là số' })
    @Min(0, { message: 'Thời gian dự kiến không được âm' })
    estimatedDurationMin: number;

    @IsOptional()
    @IsArray({ message: 'Danh sách trạm phải là mảng' })
    @IsInt({ each: true, message: 'Id trạm dừng phải là số nguyên'})
    stationIds?: number[];

    @IsOptional()
    @IsString({ message: 'routeGeometry phải là chuỗi' })
    routeGeometry?: string;

    @IsOptional()
    @IsString({ message: 'waypoints phải là chuỗi' })
    waypoints?: string;
}
