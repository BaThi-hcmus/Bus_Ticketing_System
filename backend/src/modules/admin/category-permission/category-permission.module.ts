import { Module } from '@nestjs/common';
import { CategoryPermissionService } from './category-permission.service';
import { CategoryPermissionController } from './category-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryPermission } from 'src/database/entities/categoryPermission.entity';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryPermission])],
  controllers: [CategoryPermissionController],
  providers: [CategoryPermissionService, FilterStatus, Search, Pagination, Sort],
})
export class CategoryPermissionModule {}
