import { Controller, Get, Post, Body, Patch, Query, Param } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create.route.dto';
import { EditRouteDto } from './dto/edit.route.dto';

@Controller('admin/route')
export class RouteController {
  constructor(private readonly routeService: RouteService) { }

  @Get()
  async getRoutes(
    @Query('status') status: string,
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('sortType') sortType: string
  ) {
    const result = await this.routeService.getRoutes(status, keyword, page, sortType);

    return {
      message: 'Lấy danh sách tuyến đường thành công',
      data: result
    }
  }

  @Post('create')
  async createRoute(@Body() createRouteDto: CreateRouteDto) {
    const result = await this.routeService.createRoute(createRouteDto);

    return {
      message: 'Thêm mới tuyến đường thành công',
      data: result
    }
  }

  @Patch('edit/:id')
  async editRoute(@Param('id') id: number, @Body() editRouteDto: EditRouteDto) {
    const result = await this.routeService.editRoute(id, editRouteDto);

    return {
      message: 'Chỉnh sửa tuyến đường thành công',
      data: result
    }
  }

  @Get('detail/:id')
  async getRouteDetail(@Param('id') id: number) {
    const result = await this.routeService.getRouteDetail(id);

    return {
      message: 'Lấy thông tin chi tiết tuyến đường thành công',
      data: result
    }
  }
}
