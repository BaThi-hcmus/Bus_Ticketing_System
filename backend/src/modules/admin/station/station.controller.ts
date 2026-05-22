import {
    Controller,
    Post,
    Body,
    Patch,
    Query,
    Param,
    Get,
} from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create.station.dto';
import { EditStationDto } from './dto/edit.station.dto';

@Controller('admin/station')
export class StationController {
    constructor(private readonly stationService: StationService) { }

    @Get()
    async getStations(
        @Query('status') status: string,
        @Query('keyword') keyword: string,
        @Query('page') page: number,
        @Query('sortType') sortType: string
    ) {
        const result = await this.stationService.getStations(status, keyword, page, sortType);

        return {
            message: 'Lấy danh sách trạm dừng thành công',
            data: result,
        };
    }

    @Get('all')
    async getAllStations() {
        const result = await this.stationService.getAllStations();

        return {
            message: 'Lấy danh sách trạm dừng thành công',
            data: result,
        };
    }

    @Post('create')
    async createStation(@Body() createStationDto: CreateStationDto) {
        const result = await this.stationService.createStation(createStationDto);

        return {
            message: 'Thêm mới trạm dừng thành công',
            data: result,
        };
    }

    @Patch('edit/:id')
    async editStation(@Param('id') id: number, @Body() editStationDto: EditStationDto) {
        const result = await this.stationService.editStation(id, editStationDto);

        return {
            message: 'Chỉnh sửa trạm dừng thành công',
            data: result,
        };
    }

    @Get('detail/:id')
    async getStationDetail(@Param('id') id: number) {
        const result = await this.stationService.getStationDetail(id);

        return {
            message: 'Lấy thông tin chi tiết trạm dừng thành công',
            data: result,
        };
    }
}
