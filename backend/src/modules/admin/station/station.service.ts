import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from 'src/database/entities/station.entity';

@Injectable()
export class StationService implements OnModuleInit {
    constructor(
        @InjectRepository(Station) private readonly stationRepo: Repository<Station>
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

    async getAllStations() {
        return await this.stationRepo.find({
            where: { deleted: false },
            order: { name: 'ASC' }
        });
    }

    async createStation(name: string, address: string, lat: number, lng: number) {
        const station = this.stationRepo.create({ name, address, lat, lng });
        return await this.stationRepo.save(station);
    }
}
