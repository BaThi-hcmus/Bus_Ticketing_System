import {
  Controller,
  Post,
  Body,
  Patch,
  Query,
  Param,
  Delete,
  Get
} from '@nestjs/common';
import { BusService } from './bus.service';
import { CreateBusDto } from './dto/create.bus.dto';
import { EditBusDto } from './dto/edit.bus.dto';

@Controller('admin/bus')
export class BusController {
  constructor(private readonly busService: BusService) { }

  @Get()
  async getBuses(
    @Query('status') status: string,
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('sortType') sortType: string
  ) {
    const result = await this.busService.getBuses(status, keyword, page, sortType);

    return {
      message: 'Lấy danh sách bus thành công',
      data: result
    }
  }

  @Post('create')
  async createBus(@Body() createBusDto: CreateBusDto) {
    const result = await this.busService.createBus(createBusDto);

    return {
      message: 'Thêm mới bus thành công',
      data: result
    }
  }

  @Patch('edit/:id')
  async editBus(@Param('id') id: number, @Body() editBusDto: EditBusDto) {
    const result = await this.busService.editBus(id, editBusDto);

    return {
      message: 'Chỉnh sửa bus thành công',
      data: result
    }
  }

  @Get('detail/:id')
  async getBusDetail(@Param('id') id: number) {
    const result = await this.busService.getBusDetail(id);

    return {
      message: 'Lấy thông tin chi tiết xe bus thành công',
      data: result
    }
  }
}
