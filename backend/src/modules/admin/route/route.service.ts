import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Route } from 'src/database/entities/route.entity';
import { RouteStation } from 'src/database/entities/routeStation.entity';
import { CreateRouteDto } from './dto/create.route.dto';
import { EditRouteDto } from './dto/edit.route.dto';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';
import { GeocodingUtil } from 'src/utils/geocoding.util';
import { RouteStatus } from 'src/database/entities/route.entity';

@Injectable()
export class RouteService {
    constructor(
        @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
        @InjectRepository(RouteStation) private readonly routeStationRepo: Repository<RouteStation>,
        private readonly filterStatus: FilterStatus,
        private readonly search: Search,
        private readonly pagination: Pagination,
        private readonly sort: Sort,
        private readonly geocoding: GeocodingUtil,
    ) { }

    async getRoutes(status: string, keyword: string, page: number, sortType: string): Promise<any> {
        const queryCondition = { deleted: false };

        // Lọc trạng thái
        const filterStatusList = [
            {
                name: "Tấc cả",
                status: "",
                class: "active"
            },
            {
                name: "Hoạt động",
                status: RouteStatus.ACTIVE,
                class: ""
            },
            {
                name: "Dừng hoạt động",
                status: RouteStatus.INACTIVE,
                class: ""
            },
            {
                name: "Bảo trì",
                status: RouteStatus.SUSPENDED,
                class: ""
            }
        ]
        const filterStatusObject = this.filterStatus.filterStatus(status, queryCondition, filterStatusList);

        const { searchResult, whereCondition } = this.search.search(
            keyword, 
            queryCondition, 
            ["departureStation.name", "destinationStation.name"]);

        const paginationObject = await this.pagination.pagination(page, whereCondition, this.routeRepo);

        const sortList = [
            { name: "Điểm đi (A-Z)", type: "departureLocation.name-src" },
            { name: "Điểm đi (Z-A)", type: "departureLocation.name-desc" },
            { name: "Điểm đến (A-Z)", type: "destinationLocation.name-src" },
            { name: "Điểm đến (Z-A)", type: "destinationLocation.name-desc" },
            { name: "Khoảng cách tăng dần", type: "distanceKm-src" },
            { name: "Khoảng cách giảm dần", type: "distanceKm-desc" },
            { name: "Thời gian tạo tăng dần", type: "createdAt-src" },
            { name: "Thời gian tạo giảm dần", type: "createdAt-desc" }
        ];
        const orderCondition = this.sort.sort(sortType, sortList);

        const result = await this.routeRepo.find({
            where: whereCondition,
            order: orderCondition,
            skip: paginationObject.startIndex,
            take: paginationObject.itemPerPage,
            relations: [
                'routeStations', 
                'routeStations.station', // Lấy kèm thông tin trạm để đếm số trạm hiển thị UI
                'departureStation', // 🌟 BẮT BUỘC PHẢI THÊM ĐỂ SORT ĐIỂM ĐI
                'destinationStation' // 🌟 BẮT BUỘC PHẢI THÊM ĐỂ SORT ĐIỂM ĐẾN 
            ] 
        });

        return {
            data: result,
            filterStatusObject: filterStatusObject,
            searchResult: searchResult,
            paginationObject: paginationObject,
            sortType: sortType,
            sortList: sortList
        };
    }

    // So sánh mảng trạm đầu vào với mảng trạm của một tuyến đường có sẵn
    private isStationsIdentical(existingStations: RouteStation[], inputStationIds: number[]): boolean {
        if (!existingStations || !inputStationIds || existingStations.length != inputStationIds.length) return false;

        // sắp xếp lại theo thứ tự
        const sortedExisting = [...existingStations].sort((a, b) => a.stopOrder - b.stopOrder);

        // Thêm stopOrder cho mảng input 
        const sortedInput = [...inputStationIds].map((s, index) => {
            return {
                stationId: s,
                stopOrder: index + 1
            }
        })

        // So sánh từng trạm
        for (let i = 0; i < sortedExisting.length; i++) {
            if (sortedExisting[i].stationId != sortedInput[i].stationId) return false;
        }

        return true;
    }

    async createRoute(createRouteDto: CreateRouteDto): Promise<void> {
        //Lấy ra tấc cả các tuyến đường cần kiểm tra 
        const possibleDuplicateRoutes = await this.routeRepo.find({
            where: {
                deleted: false,
                departureStationId: Number(createRouteDto.departureStationId),
                destinationStationId: Number(createRouteDto.destinationStationId)
            },
            relations: [
                'routeStations'
            ]
        })

        //Nếu người dùng có nhập station thì kiểm tra trùng 
        if (createRouteDto.stationIds && createRouteDto.stationIds.length > 0) {
            for (const route of possibleDuplicateRoutes) {
                if (this.isStationsIdentical(route.routeStations, createRouteDto.stationIds)) {
                    throw new ConflictException('Tuyến đường bạn vừa nhập đã tồn tại trong hệ thống');
                }
            }
        }

        // Nếu không trùng thì thực hiện thêm vào DB
        // Thêm route
        const newRoute = this.routeRepo.create({
            departureStationId: createRouteDto.departureStationId,
            destinationStationId: createRouteDto.destinationStationId,
            distanceKm: createRouteDto.distanceKm,
            estimatedDurationMin: createRouteDto.estimatedDurationMin,
            routeGeometry: createRouteDto.routeGeometry,
            waypoints: createRouteDto.waypoints
        })

        const savedRoute = await this.routeRepo.save(newRoute);

        //Thêm các routeStations
        if (createRouteDto.stationIds && createRouteDto.stationIds.length > 0) {
            const newRouteStations = [...createRouteDto.stationIds].map((stationId, index) => {
                // gọi api tính khoảng cách 2 điểm để lưu cho biến distanceFromStart
                return this.routeStationRepo.create({
                    routeId: savedRoute.id,
                    stationId: stationId,
                    stopOrder: index + 1,
                    distanceFromStart: 100
                })
            })

            await this.routeStationRepo.save(newRouteStations);
        }
    }

    async editRoute(id: number, editRouteDto: EditRouteDto): Promise<void> {
        //Kiểm tra tuyến đường cần sửa có tồn tại không
        const route = await this.routeRepo.findOne({
            where: { id: id, deleted: false },
            relations: ['routeStations']
        });

        if (!route) {
            throw new NotFoundException(`Không tìm thấy tuyến đường có ID: ${id}`);
        }

        //Xác định các giá trị mới hoặc giữ nguyên giá trị không cập nhật
        const newDepartureStationId = editRouteDto.departureStationId || route.departureStationId;
        const newDestinationStationId = editRouteDto.destinationStationId || route.destinationStationId;

        // Nếu client không truyền stations mới, lấy stations hiện tại của tuyến đường
        const stationIdsToCheck = editRouteDto.stationIds || route.routeStations.map(rs => rs.stationId);

        // Lấy ra danh sách các tuyến đường trùng điểm đầu và điểm cuối nhưng khác id để kiểm tra
        const possibleDuplicateRoutes = await this.routeRepo.find({
            where: {
                id: Not(id),
                deleted: false,
                departureStationId: newDepartureStationId,
                destinationStationId: newDestinationStationId
            },
            relations: ['routeStations']
        })

        //Kiểm tra trùng 
        if (possibleDuplicateRoutes && possibleDuplicateRoutes.length > 0) {
            for (const route of possibleDuplicateRoutes) {
                if (this.isStationsIdentical(route.routeStations, stationIdsToCheck)) {
                    throw new ConflictException('Tuyến đường sau khi chỉnh sửa trùng khớp với một tuyến khác đã tồn tại!');
                }
            }
        }

        //Nếu không trùng thì tiến hành cập nhật
        //Cập nhật Route
        const {stationIds, ...updateData} = editRouteDto;

        if (Object.keys(updateData).length > 0) {
            await this.routeRepo.update({ id: id }, updateData);
        }

        //Cập nhật routeStations
        if (stationIds) {
            //xóa stations cũ
            await this.routeStationRepo.delete({ routeId: id });

            // Thêm stations mới 
            if (stationIds.length > 0) {
                const newRouteStations = [...stationIds].map((stationId, index) => {
                    return this.routeStationRepo.create({
                        routeId: id,
                        stationId: stationId,
                        distanceFromStart: 100, //tạm thời hardcode, sau này gọi api để tính
                        stopOrder: index + 1
                    })
                })
    
                await this.routeStationRepo.save(newRouteStations);
            }
        }
    }


    async getRouteDetail(id: number): Promise<any> {
        const route = await this.routeRepo.findOne({
            where: {
                id: id,
                deleted: false
            },
            relations: [
                'trips', 
                'routeStations', 
                'routeStations.station',
                'depatureStation',
                'destinationStation'
            ]
        })

        if (!route) {
            throw new NotFoundException(`Không tìm thấy route có id: ${id}`);
        }

        //sắp xếp lại các station theo thứ tự
        if (route.routeStations && route.routeStations.length > 0) {
            route.routeStations.sort((a, b) => a.stopOrder - b.stopOrder);
        }

        return route;
    }

    async autocompleteLocation(query: string) {
        return this.geocoding.searchLocations(query);
    }
}
