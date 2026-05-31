import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/database/entities/permission.entity';
import { CategoryPermission } from 'src/database/entities/categoryPermission.entity';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, CategoryPermission])],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    FilterStatus,
    Search,
    Pagination,
    Sort
  ],
})
export class PermissionModule { }

