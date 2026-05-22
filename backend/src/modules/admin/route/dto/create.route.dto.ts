import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RouteStationItemDto } from './route-station-item.dto';

export class CreateRouteDto {
    @IsNotEmpty({ message: 'Điểm đi không được để trống' })
    @IsString({ message: 'Điểm đi phải là chuỗi ký tự' })
    departureLocation: string;

    @IsNotEmpty({ message: 'Điểm đến không được để trống' })
    @IsString({ message: 'Điểm đến phải là chuỗi ký tự' })
    destinationLocation: string;

    @IsNumber({}, { message: 'Khoảng cách phải là số' })
    @Min(0, { message: 'Khoảng cách không được âm' })
    distanceKm: number;

    @IsNumber({}, { message: 'Thời gian dự kiến phải là số' })
    @Min(0, { message: 'Thời gian dự kiến không được âm' })
    estimatedDuration: number;

    @IsOptional()
    @IsArray({ message: 'Danh sách trạm phải là mảng' })
    @ValidateNested({ each: true })
    @Type(() => RouteStationItemDto)
    stations?: RouteStationItemDto[];

    @IsOptional()
    @IsString({ message: 'routeGeometry phải là chuỗi' })
    routeGeometry?: string;

    @IsOptional()
    @IsString({ message: 'waypoints phải là chuỗi' })
    waypoints?: string;
}
