import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/entities/role.entity';
import { UserRole } from 'src/database/entities/userRole.entity';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  controllers: [UserController],
  providers: [
    UserService,
    FilterStatus,
    Search,
    Pagination,
    Sort
  ],
})
export class UserModule {}

