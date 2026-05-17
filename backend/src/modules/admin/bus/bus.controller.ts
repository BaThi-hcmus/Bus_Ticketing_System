import { Controller, Post, Body } from '@nestjs/common';
import { BusService } from './bus.service';
import { CreateBusDto } from './dto/create.bus.dto';

@Controller('admin/bus')
export class BusController {
  constructor(private readonly busService: BusService) { }

  @Post('create')
  async createBus(@Body() createBusDto: CreateBusDto) {
    const result = await this.busService.createBus(createBusDto);

    return {
      message: 'Thêm mới bus thành công',
      data: result
    }
  }
}
