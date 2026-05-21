import { Controller, Get } from '@nestjs/common';
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
}
