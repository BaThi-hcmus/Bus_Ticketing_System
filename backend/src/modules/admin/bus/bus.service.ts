import { Injectable } from '@nestjs/common';
import { Bus } from 'src/database/entities/bus.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBusDto } from './dto/create.bus.dto';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class BusService {
    constructor(
        //Tiêm repository của typeORM vào
        @InjectRepository(Bus)
        private readonly busRepo: Repository<Bus>
    ) { }

    async createBus(createBusDto: CreateBusDto): Promise<Bus> {
        const licensePlate = createBusDto.licensePlate;

        //kiểm tra biển số xe có tồn tại chưa
        const isBusExist = await this.busRepo.findOne({
            where: { licensePlate: licensePlate }
        })

        //Nếu tồn tại thì báo lỗi
        if (isBusExist) {
            throw new ConflictException(`Biển số xe [${licensePlate}] đã tồn tại`);
        }

        //Tạo bus mới và lưu vào DB
        const newBus = this.busRepo.create(createBusDto);
        await this.busRepo.save(newBus);

        return newBus;
    }
}
