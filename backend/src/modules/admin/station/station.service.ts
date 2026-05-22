import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between } from 'typeorm';
import { Station } from 'src/database/entities/station.entity';
import { CreateStationDto } from './dto/create.station.dto';
import { EditStationDto } from './dto/edit.station.dto';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';
import { Haversine } from 'src/utils/haversine.util';

@Injectable()
export class StationService implements OnModuleInit {
    constructor(
        @InjectRepository(Station) private readonly stationRepo: Repository<Station>,
        private readonly filterStatus: FilterStatus,
        private readonly search: Search,
        private readonly pagination: Pagination,
        private readonly sort: Sort,
        private readonly haversine: Haversine
    ) { }

    async onModuleInit() {
        const seedStations = [
            { name: 'Bến xe Miền Đông', address: 'Bình Thạnh, TP.HCM', lat: 10.814324, lng: 106.711804 },
            { name: 'Bến xe Miền Tây', address: 'Bình Tân, TP.HCM', lat: 10.732997, lng: 106.621287 },
            { name: 'Bến xe Đà Lạt', address: 'Phường 3, Đà Lạt', lat: 11.932970, lng: 108.435728 },
            { name: 'Bến xe Nha Trang', address: 'Vĩnh Hải, Nha Trang', lat: 12.274191, lng: 109.198270 },
            { name: 'Bến xe Mỹ Đình', address: 'Nam Từ Liêm, Hà Nội', lat: 21.028741, lng: 105.779774 },
            { name: 'Trạm dừng chân Phương Trang', address: 'Dọc QL1A, Đồng Nai', lat: 10.932766, lng: 107.039603 },
            { name: 'Trạm thu phí Long Thành', address: 'Cao tốc Long Thành', lat: 10.796328, lng: 106.945084 }
        ];

        for (const s of seedStations) {
            const existing = await this.stationRepo.findOne({ where: { name: s.name } });
            if (!existing) {
                const station = this.stationRepo.create(s);
                await this.stationRepo.save(station);
            } else if (!existing.lat || !existing.lng) {
                existing.lat = s.lat;
                existing.lng = s.lng;
                await this.stationRepo.save(existing);
            }
        }
        console.log('Seeded stations data with coordinates.');
    }

    async getStations(status: string, keyword: string, page: number, sortType: string): Promise<any> {
        const queryCondition = {
            deleted: false,
        };

        const filterStatusObject = this.filterStatus.filterStatus(status, queryCondition);

        const { searchResult, whereCondition } = this.search.search(
            keyword,
            queryCondition,
            ['name', 'address']
        );

        const paginationObject = await this.pagination.pagination(page, whereCondition, this.stationRepo);

        const sortList = [
            { name: 'Tên trạm (A-Z)', type: 'name-src' },
            { name: 'Tên trạm (Z-A)', type: 'name-desc' },
            { name: 'Địa chỉ (A-Z)', type: 'address-src' },
            { name: 'Địa chỉ (Z-A)', type: 'address-desc' },
            { name: 'Thời gian tạo tăng dần', type: 'createdAt-src' },
            { name: 'Thời gian tạo giảm dần', type: 'createdAt-desc' },
        ];
        const orderCondition = this.sort.sort(sortType, sortList);

        const result = await this.stationRepo.find({
            where: whereCondition,
            order: orderCondition,
            skip: paginationObject.startIndex,
            take: paginationObject.itemPerPage,
        });

        return {
            data: result,
            filterStatusObject: filterStatusObject,
            searchResult: searchResult,
            paginationObject: paginationObject,
            sortType: sortType,
            sortList: sortList,
        };
    }

    async getAllStations(): Promise<Station[]> {
        return await this.stationRepo.find({
            where: { deleted: false, status: 'active' },
            order: { name: 'ASC' },
        });
    }

    async createStation(createStationDto: CreateStationDto): Promise<Station> {
        if (!createStationDto.lat || !createStationDto.lng) {
            throw new ConflictException('Vui lòng cung cấp tọa độ');
        }
        // Bán kính cho phép
        const allowedRadiusMeters = 50; 
        // Lấy ra các station cần kiểm tra
        // 1 độ vĩ độ ~ 111,000 mét => 1 mét ~ 0.000009 độ
        // Sai số vĩ độ/kinh độ cho hình vuông bao quanh dựa trên số mét cấu hình
        const degreeOffset = allowedRadiusMeters * 0.000009;

        // Tọa độ biên của hình vuông (Bounding Box)
        const minLat = createStationDto.lat - degreeOffset;
        const maxLat = createStationDto.lat + degreeOffset;
        const minLng = createStationDto.lng - degreeOffset;
        const maxLng = createStationDto.lng + degreeOffset;

        const possibleDuplicateStations = await this.stationRepo.find({
            where: {
                deleted: false,
                lat: Between(minLat, maxLat), 
                lng: Between(minLng, maxLng)
            }
        })

        //Kiểm tra bằng haversine
        for (const candidate of possibleDuplicateStations) {
            const distance = this.haversine.calculateHaversineDistance(
                createStationDto.lat as number, createStationDto.lng as number,
                candidate.lat, candidate.lng
            )

            if (distance <= allowedRadiusMeters) {
                throw new ConflictException('Trạm dừng này đã tồn tại trong hệ thống');
            }
        }

        const newStation = this.stationRepo.create(createStationDto);
        await this.stationRepo.save(newStation);

        return newStation;
    }

    async editStation(id: number, editStationDto: EditStationDto): Promise<Station> {
        // Kiểm tra station cần sửa có tồn tại hay chưa
        const station = await this.stationRepo.findOne({
            where: { id: id, deleted: false },
        });

        if (!station) {
            throw new NotFoundException(`Không tìm thấy trạm dừng có ID [${id}] để cập nhật`);
        }

        // Kiểm tra: nếu admin sửa địa chỉ thì phải so khớp tọa độ admin gửi lên với tọa độ trong db
        if (editStationDto.address != null && editStationDto.address.trim() != (station.address ?? '').trim()) {
            if (editStationDto.lat == null || editStationDto.lng == null) {
                throw new ConflictException('Vui lòng gửi đầy đủ tọa độ');
            }

            if (editStationDto.lat == station.lat && editStationDto.lng == station.lng) {
                throw new ConflictException('Bạn thay đổi địa chỉ nhưng chưa đổi tọa độ');
            }
        }


        // Nếu tọa độ khác trong db thì phải kiểm tra trùng 
        if (editStationDto.lat 
            && editStationDto.lng
            && Number(editStationDto.lat.toFixed(6)) != Number(station.lat.toFixed(6))
            && Number(editStationDto.lng.toFixed(6)) != Number(station.lng.toFixed(6))
        ) {
            //Kiểm tra trùng 
            // Bán kính cho phép
            const allowedRadiusMeters = 50; 
            // Lấy ra các station cần kiểm tra
            // 1 độ vĩ độ ~ 111,000 mét => 1 mét ~ 0.000009 độ
            // Sai số vĩ độ/kinh độ cho hình vuông bao quanh dựa trên số mét cấu hình
            const degreeOffset = allowedRadiusMeters * 0.000009;

            // Tọa độ biên của hình vuông (Bounding Box)
            const minLat = editStationDto.lat - degreeOffset;
            const maxLat = editStationDto.lat + degreeOffset;
            const minLng = editStationDto.lng - degreeOffset;
            const maxLng = editStationDto.lng + degreeOffset;

            const possibleDuplicateStations = await this.stationRepo.find({
                where: {
                    id: Not(id),
                    deleted: false,
                    lat: Between(minLat as number, maxLat as number), 
                    lng: Between(minLng as number, maxLng as number)
                }
            })

            //Kiểm tra bằng haversine
            for (const candidate of possibleDuplicateStations) {
                const distance = this.haversine.calculateHaversineDistance(
                    editStationDto.lat as number, editStationDto.lng as number,
                    candidate.lat, candidate.lng
                )

                if (distance <= allowedRadiusMeters) {
                    throw new ConflictException('Trạm dừng này đã tồn tại trong hệ thống');
                }
            }
        }

        await this.stationRepo.update({ id: id }, editStationDto);

        const updatedStation = await this.stationRepo.findOne({ where: { id: id } });
        return updatedStation as Station;
    }

    async getStationDetail(id: number): Promise<Station> {
        const station = await this.stationRepo.findOne({
            where: { id: id, deleted: false },
            relations: ['routeStations', 'routeStations.route'],
        });

        if (!station) {
            throw new NotFoundException(`Không tìm thấy trạm dừng có ID [${id}]`);
        }

        return station;
    }
}
