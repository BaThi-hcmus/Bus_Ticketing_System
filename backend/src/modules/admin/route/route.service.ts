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
import { fromReadableStreamLike } from 'rxjs/internal/observable/innerFrom';
import { create } from 'domain';

@Injectable()
export class RouteService {
    constructor(
        @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
        @InjectRepository(RouteStation) private readonly routeStationRepo: Repository<RouteStation>,
        private readonly filterStatus: FilterStatus,
        private readonly search: Search,
        private readonly pagination: Pagination,
        private readonly sort: Sort
    ) { }

    async getRoutes(status: string, keyword: string, page: number, sortType: string): Promise<any> {
        const queryCondition = { deleted: false };
        const filterStatusObject = this.filterStatus.filterStatus(status, queryCondition);
        const { searchResult, whereCondition } = this.search.search(keyword, queryCondition, ["departureLocation", "destinationLocation"]);
        const paginationObject = await this.pagination.pagination(page, whereCondition, this.routeRepo);

        const sortList = [
            { name: "Điểm đi (A-Z)", type: "departureLocation-src" },
            { name: "Điểm đi (Z-A)", type: "departureLocation-desc" },
            { name: "Điểm đến (A-Z)", type: "destinationLocation-src" },
            { name: "Điểm đến (Z-A)", type: "destinationLocation-desc" },
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
            relations: ['routeStations', 'routeStations.station'] // Lấy kèm thông tin trạm để đếm số trạm hiển thị UI
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
    private isStationsIdentical(existingStations: RouteStation[], inputStations: any[]): boolean {
        if (!existingStations || !inputStations || existingStations.length != inputStations.length) return false;

        // sắp xếp lại theo thứ tự
        const sortedExisting = [...existingStations].sort((a, b) => a.stopOrder - b.stopOrder);

        // Thêm stopOrder cho mảng input 
        const sortedInput = [...inputStations].map((s, index) => {
            return {
                ...s,
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
                departureLocation: createRouteDto.departureLocation,
                destinationLocation: createRouteDto.destinationLocation
            },
            relations: ['routeStations']
        })

        //Nếu người dùng có nhập station thì kiểm tra trùng 
        if (createRouteDto.stations && createRouteDto.stations.length > 0) {
            for (const route of possibleDuplicateRoutes) {
                if (this.isStationsIdentical(route.routeStations, createRouteDto.stations)) {
                    throw new ConflictException('Tuyến đường bạn vừa nhập đã tồn tại trong hệ thống');
                }
            }
        }

        // Nếu không trùng thì thực hiện thêm vào DB
        // Thêm route
        const newRoute = await this.routeRepo.create({
            departureLocation: createRouteDto.departureLocation,
            destinationLocation: createRouteDto.destinationLocation,
            distanceKm: createRouteDto.distanceKm,
            estimatedDuration: createRouteDto.estimatedDuration
        })

        const savedRoute = await this.routeRepo.save(newRoute);

        //Thêm các routeStations
        if (createRouteDto.stations && createRouteDto.stations.length > 0) {
            const newRouteStations = [...createRouteDto.stations].map((s, index) => {
                return this.routeStationRepo.create({
                    routeId: savedRoute.id,
                    stationId: s.stationId,
                    stopOrder: index + 1,
                    distanceFromStart: s.distanceFromStart
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
        const newDeparture = editRouteDto.departureLocation || route.departureLocation;
        const newDestination = editRouteDto.destinationLocation || route.destinationLocation;

        // Nếu client không truyền stations mới, lấy stations hiện tại của tuyến đường
        const stationsToCheck = editRouteDto.stations || route.routeStations.map(rs => ({
            stationId: rs.stationId,
            distanceFromStart: rs.distanceFromStart
        }));

        // Lấy ra danh sách các tuyến đường trùng điểm đầu và điểm cuối nhưng khác id để kiểm tra
        const possibleDuplicateRoutes = await this.routeRepo.find({
            where: {
                id: Not(id),
                deleted: false,
                departureLocation: newDeparture,
                destinationLocation: newDestination
            },
            relations: ['routeStations']
        })

        //Kiểm tra trùng 
        if (possibleDuplicateRoutes && possibleDuplicateRoutes.length > 0) {
            for (const route of possibleDuplicateRoutes) {
                if (this.isStationsIdentical(route.routeStations, stationsToCheck as any[])) {
                    throw new ConflictException('Tuyến đường sau khi chỉnh sửa trùng khớp với một tuyến khác đã tồn tại!');
                }
            }
        }

        //Nếu không trùng thì tiến hành cập nhật
        //Cập nhật Route
        const editData = { ...editRouteDto };
        delete editData.stations; //Xóa station khi update cho Route

        if (Object.keys(editData).length > 0) {
            await this.routeRepo.update({ id: id }, editData);
        }

        //Cập nhật routeStations
        if (editRouteDto.stations && editRouteDto.stations.length > 0) {
            //xóa stations cũ
            await this.routeStationRepo.delete({ routeId: id });

            // Thêm stations mới 
            const newRouteStations = [...editRouteDto.stations].map((s, index) => {
                return this.routeStationRepo.create({
                    routeId: id,
                    stationId: s.stationId,
                    distanceFromStart: s.distanceFromStart,
                    stopOrder: index + 1
                })
            })

            await this.routeStationRepo.save(newRouteStations);
        }
    }

    async getRouteDetail(id: number): Promise<any> {
        const route = await this.routeRepo.findOne({
            where: {
                id: id,
                deleted: false
            },
            relations: ['trips', 'routeStations', 'routeStations.station']
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
}
