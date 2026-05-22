import {
    IsOptional,
    IsString,
    IsNumber,
    IsIn,
    IsBoolean,
    IsArray,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RouteStationItemDto } from './route-station-item.dto';

export class EditRouteDto {
    @IsOptional()
    @IsString({ message: 'Điểm đi phải là chuỗi ký tự' })
    departureLocation?: string;

    @IsOptional()
    @IsString({ message: 'Điểm đến phải là chuỗi ký tự' })
    destinationLocation?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Khoảng cách phải là số' })
    @Min(0, { message: 'Khoảng cách không được âm' })
    distanceKm?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Thời gian dự kiến phải là số' })
    @Min(0, { message: 'Thời gian dự kiến không được âm' })
    estimatedDuration?: number;

    @IsOptional()
    @IsIn(['active', 'inactive'], { message: 'Trạng thái phải là active hoặc inactive' })
    status?: string;

    @IsOptional()
    @IsBoolean({ message: 'deleted phải là boolean' })
    deleted?: boolean;

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
