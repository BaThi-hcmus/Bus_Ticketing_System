import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { Route } from 'src/database/entities/route.entity';
import { RouteStation } from 'src/database/entities/routeStation.entity';
import { FilterStatus } from 'src/utils/filterStatus.util';
import { Search } from 'src/utils/search.util';
import { Pagination } from 'src/utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';
import { GeocodingUtil } from 'src/utils/geocoding.util';

@Module({
  imports: [TypeOrmModule.forFeature([Route, RouteStation])],
  controllers: [RouteController],
  providers: [
    RouteService,
    FilterStatus,
    Search,
    Pagination,
    Sort,
    GeocodingUtil,
  ]
})
export class RouteModule {}
