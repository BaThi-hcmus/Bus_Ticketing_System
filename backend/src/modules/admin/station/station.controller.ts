import { Controller, Get, Post, Body } from '@nestjs/common';
import { StationService } from './station.service';

@Controller('admin/station')
export class StationController {
    constructor(private readonly stationService: StationService) { }

    @Get()
    async getAllStations() {
        const result = await this.stationService.getAllStations();
        return {
            message: 'Lấy danh sách trạm dừng thành công',
            data: result
        }
    }

    @Post('create')
    async createStation(@Body() body: { name: string; address: string; lat: number; lng: number }) {
        const result = await this.stationService.createStation(body.name, body.address, body.lat, body.lng);
        return {
            message: 'Tạo trạm dừng thành công',
            data: result
        }
    }
}
