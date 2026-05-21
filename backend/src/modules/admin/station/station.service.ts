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
        // Seed trạm xe ảo để dễ test
        const count = await this.stationRepo.count();
        if (count === 0) {
            const seedStations = [
                { name: 'Bến xe Miền Đông', address: 'Bình Thạnh, TP.HCM' },
                { name: 'Bến xe Miền Tây', address: 'Bình Tân, TP.HCM' },
                { name: 'Bến xe Đà Lạt', address: 'Phường 3, Đà Lạt' },
                { name: 'Bến xe Nha Trang', address: 'Vĩnh Hải, Nha Trang' },
                { name: 'Bến xe Mỹ Đình', address: 'Nam Từ Liêm, Hà Nội' },
                { name: 'Trạm dừng chân Phương Trang', address: 'Dọc QL1A, Đồng Nai' },
                { name: 'Trạm thu phí Long Thành', address: 'Cao tốc Long Thành' }
            ];

            for (const s of seedStations) {
                const station = this.stationRepo.create(s);
                await this.stationRepo.save(station);
            }
            console.log('Seeded stations data.');
        }
    }

    async getAllStations() {
        return await this.stationRepo.find({
            where: { deleted: false },
            order: { name: 'ASC' }
        });
    }
}
