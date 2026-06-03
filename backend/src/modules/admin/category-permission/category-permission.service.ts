import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CategoryPermission } from 'src/database/entities/categoryPermission.entity';
import { CreateCategoryPermissionDto } from './dto/create.category-permission.dto';
import { EditCategoryPermissionDto } from './dto/edit.category-permission.dto';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';
import { CategoryPermissionStatus } from 'src/database/entities/categoryPermission.entity';

@Injectable()
export class CategoryPermissionService {
    constructor(
        @InjectRepository(CategoryPermission) private categoryRepo: Repository<CategoryPermission>,
        private readonly filterStatus: FilterStatus,
        private readonly search: Search,
        private readonly pagination: Pagination,
        private readonly sort: Sort
    ) { }

    async getPaginated(status: string, keyword: string, page: number, sortType: string): Promise<any> {
        const queryCondition = { deleted: false };

        //filter
        const filterStatusList = [
            {
                name: "Tấc cả",
                status: "",
                class: "active"
            },
            {
                name: "Hoạt động",
                status: CategoryPermissionStatus.ACTIVE,
                class: ""
            },
            {
                name: "Dừng hoạt động",
                status: CategoryPermissionStatus.INACTIVE,
                class: ""
            }
        ]
        const filterStatusObject = this.filterStatus.filterStatus(status, queryCondition, filterStatusList);

        //search
        const { searchResult, whereCondition } = this.search.search(
            keyword,
            queryCondition,
            ["name"]
        );

        //pagination
        const paginationObject = await this.pagination.pagination(page, whereCondition, this.categoryRepo);

        //sort
        const sortList = [
            { name: "Tên danh mục tăng dần", type: "name-src" },
            { name: "Tên danh mục giảm dần", type: "name-desc" },
            { name: "ID tăng dần", type: "id-src" },
            { name: "ID giảm dần", type: "id-desc" }
        ];
        const orderCondition = this.sort.sort(sortType, sortList);

        const categoryPermissions = await this.categoryRepo.find({
            where: whereCondition,
            order: orderCondition,
            skip: paginationObject.startIndex,
            take: paginationObject.itemPerPage,
        });

        return {
            data: categoryPermissions,
            filterStatusObject: filterStatusObject,
            keyword: searchResult,
            paginationObject: paginationObject,
            sortList: sortList
        };
    }

    async getAll(): Promise<CategoryPermission[]> {
        return await this.categoryRepo.find({
            where: { deleted: false, status: 'active' },
            order: { name: 'ASC' }
        });
    }

    async create(createDto: CreateCategoryPermissionDto): Promise<CategoryPermission> {
        const exist = await this.categoryRepo.findOne({
            where: { name: createDto.name, deleted: false }
        });

        if (exist) {
            throw new ConflictException(`Danh mục [${createDto.name}] đã tồn tại trong hệ thống`);
        }

        const category = this.categoryRepo.create(createDto);
        return await this.categoryRepo.save(category);
    }

    async update(id: number, editDto: EditCategoryPermissionDto): Promise<void> {
        const category = await this.categoryRepo.findOne({ where: { id, deleted: false } });

        if (!category) {
            throw new NotFoundException(`Không tìm thấy danh mục có ID [${id}]`);
        }

        if (editDto.name) {
            const exist = await this.categoryRepo.findOne({
                where: {
                    id: Not(id),
                    name: editDto.name,
                    deleted: false
                }
            });

            if (exist) {
                throw new ConflictException(`Danh mục [${editDto.name}] đã tồn tại trong hệ thống`);
            }
        }

        const cleanFields = Object.fromEntries(
            Object.entries(editDto).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(cleanFields).length > 0) {
            await this.categoryRepo.update({ id }, cleanFields);
        }
    }

    async getDetail(id: number): Promise<CategoryPermission> {
        const category = await this.categoryRepo.findOne({ where: { id, deleted: false } });
        if (!category) {
            throw new NotFoundException(`Không tìm thấy danh mục có ID [${id}]`);
        }
        return category;
    }
}
