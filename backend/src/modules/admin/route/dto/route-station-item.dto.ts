import { IsInt, IsNumber, Min } from 'class-validator';

export class RouteStationItemDto {
    @IsInt({ message: 'Mã trạm phải là số nguyên' })
    @Min(1, { message: 'Mã trạm không hợp lệ' })
    stationId: number;

    @IsNumber({}, { message: 'Khoảng cách từ điểm đi phải là số' })
    @Min(0, { message: 'Khoảng cách từ điểm đi không được âm' })
    distanceFromStart: number;
}
