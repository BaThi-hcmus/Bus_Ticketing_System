import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/database/entities/permission.entity';
import { CategoryPermission } from 'src/database/entities/categoryPermission.entity';
import { Repository, Not } from 'typeorm';
import { CreatePermissionDto } from './dto/create.permission.dto';
import { EditPermissionDto } from './dto/edit.permission.dto';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission) private permisisonRepo: Repository<Permission>,
        @InjectRepository(CategoryPermission) private categoryRepo: Repository<CategoryPermission>,
        private readonly filterStatus: FilterStatus,
        private readonly search: Search,
        private readonly pagination: Pagination,
        private readonly sort: Sort
    ) { }

    async getPermissions(status: string, keyword: string, page: number, sortType: string): Promise<any> {
        const queryCondition = {
            deleted: false,
        }

        //filter
        const filterStatusObject = this.filterStatus.filterStatus(status, queryCondition);

        //search
        const { searchResult, whereCondition } = this.search.search(
            keyword,
            queryCondition,
            ["name"]
        );

        //pagination
        const paginationObject = await this.pagination.pagination(page, whereCondition, this.permisisonRepo);

        //sort
        const sortList = [
            {
                name: "Tên quyền tăng dần",
                type: "name-src"
            },
            {
                name: "Tên quyền giảm dần",
                type: "name-desc"
            },
            {
                name: "ID tăng dần",
                type: "id-src"
            },
            {
                name: "ID giảm dần",
                type: "id-desc"
            }
        ]
        const orderCondition = this.sort.sort(sortType, sortList);

        const result = await this.permisisonRepo.find({
            where: whereCondition,
            order: orderCondition,
            skip: paginationObject.startIndex,
            take: paginationObject.itemPerPage,
            relations: ['categoryPermission'],
        })

        return {
            data: result,
            filterStatusObject: filterStatusObject,
            searchResult: searchResult,
            paginationObject: paginationObject,
            sortType: sortType,
            sortList: sortList
        };
    }

    async getAllPermissions(): Promise<Permission[]> {
        return await this.permisisonRepo.find({
            where: { deleted: false, status: 'active' },
            order: { name: 'ASC' },
            relations: ['categoryPermission'],
        });
    }

    private async assertCategoryExists(categoryPermissionId: number): Promise<CategoryPermission> {
        const category = await this.categoryRepo.findOne({
            where: { id: categoryPermissionId, deleted: false },
        });

        if (!category) {
            throw new NotFoundException(`Không tìm thấy nhóm quyền có ID [${categoryPermissionId}]`);
        }

        return category;
    }

    async createPermission(createPermissionDto: CreatePermissionDto): Promise<void> {
        const isPermissionExist = await this.permisisonRepo.findOne({
            where: {
                deleted: false,
                name: createPermissionDto.name,
            },
        });

        if (isPermissionExist) {
            throw new ConflictException('Quyền này đã tồn tại trong hệ thống');
        }

        await this.assertCategoryExists(createPermissionDto.categoryPermissionId);

        const newPermisison = this.permisisonRepo.create({
            name: createPermissionDto.name,
            displayName: createPermissionDto.displayName,
            categoryPermissionId: createPermissionDto.categoryPermissionId,
        });

        await this.permisisonRepo.save(newPermisison);
    }

    async editPermission(id: number, editPermissionDto: EditPermissionDto): Promise<Permission> {
        // 1. Kiểm tra permission cần sửa có tồn tại (và chưa bị xóa) hay không
        const permission = await this.permisisonRepo.findOne({
            where: { id: id, deleted: false }
        });

        if (!permission) {
            throw new NotFoundException(`Không tìm thấy quyền có ID [${id}] để cập nhật`);
        }

        const name = editPermissionDto?.name;

        // 2. Kiểm tra trùng lặp tên quyền với các quyền khác
        if (name) {
            const isPermissionExist = await this.permisisonRepo.findOne({
                where: {
                    id: Not(id),
                    name: name,
                    deleted: false,
                },
            });

            if (isPermissionExist) {
                throw new ConflictException(`Quyền [${name}] đã tồn tại trong hệ thống`);
            }
        }

        if (editPermissionDto.categoryPermissionId != null) {
            await this.assertCategoryExists(editPermissionDto.categoryPermissionId);
        }

        await this.permisisonRepo.update({ id: id }, editPermissionDto);

        const updatedPermission = await this.permisisonRepo.findOne({
            where: { id: id },
            relations: ['categoryPermission'],
        });
        return updatedPermission as Permission;
    }

    async getPermissionDetail(id: number): Promise<Permission> {
        const permission = await this.permisisonRepo.findOne({
            where: { id: id, deleted: false },
            relations: ['categoryPermission'],
        });

        if (!permission) {
            throw new NotFoundException(`Không tìm thấy quyền có ID [${id}]`);
        }

        return permission;
    }
}

