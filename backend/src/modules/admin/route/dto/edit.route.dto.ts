import {
    IsOptional,
    IsString,
    IsNumber,
    IsIn,
    IsBoolean,
    IsArray,
    Min,
    ValidateNested,
    IsInt
} from 'class-validator';
import { Type } from 'class-transformer';
import { RouteStatus } from 'src/database/entities/route.entity';

export class EditRouteDto {
    @IsOptional()
    @IsInt({ message: 'Id điểm đi phải là số nguyên' })
    departureStationId?: number;

    @IsOptional()
    @IsInt({ message: 'Id điểm đến phải là số nguyên' })
    destinationStationId?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Khoảng cách phải là số' })
    @Min(0, { message: 'Khoảng cách không được âm' })
    distanceKm?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Thời gian dự kiến phải là số' })
    @Min(0, { message: 'Thời gian dự kiến không được âm' })
    estimatedDurationMin?: number;

    @IsOptional()
    @IsString({message: 'Trạng thái phải là chuỗi kí tự'})
    status?: RouteStatus;

    @IsOptional()
    @IsBoolean({ message: 'deleted phải là boolean' })
    deleted?: boolean;

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
