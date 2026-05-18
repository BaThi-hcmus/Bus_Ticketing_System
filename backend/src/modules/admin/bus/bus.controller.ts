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
    @Query('page') page: number
  ) {
    const result = await this.busService.getBuses(status, keyword, page);

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

  @Delete('delete/:id')
  async deleteBus(@Param('id') id: number) {
    await this.busService.deleteBus(id);

    return {
      message: 'Xóa bus thành công',
    }
  }
}
