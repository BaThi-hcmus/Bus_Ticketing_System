import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationController } from './station.controller';
import { StationService } from './station.service';
import { Station } from 'src/database/entities/station.entity';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';
import { Haversine } from 'src/utils/haversine.util';
import { GeocodingUtil } from 'src/utils/geocoding.util';

@Module({
    imports: [TypeOrmModule.forFeature([Station])],
    controllers: [StationController],
    providers: [
        StationService,
        FilterStatus,
        Search,
        Pagination,
        Sort,
        Haversine,
        GeocodingUtil,
    ],
})
export class StationModule { }
