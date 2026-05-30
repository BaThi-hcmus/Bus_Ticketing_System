import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';

@Module({
  controllers: [RoleController],
  providers: [
    RoleService,
    FilterStatus,
    Search,
    Pagination,
    Sort
  ],
})
export class RoleModule { }

