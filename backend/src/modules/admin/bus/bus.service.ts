import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Bus } from 'src/database/entities/bus.entity';
import { CreateBusDto } from './dto/create.bus.dto';
import { EditBusDto } from './dto/edit.bus.dto';

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

    async editBus(id: number, editBusDto: EditBusDto): Promise<Bus> {
        // 1. Kiểm tra xe bus cần sửa có tồn tại (và chưa bị xóa) hay không
        const bus = await this.busRepo.findOne({
            where: { id: id, deleted: false }
        });

        if (!bus) {
            throw new NotFoundException(`Không tìm thấy xe bus có ID [${id}] để cập nhật`);
        }

        const licensePlate = editBusDto.licensePlate;

        // 2. Kiểm tra trùng lặp biển số xe với các xe khác
        if (licensePlate) {
            const isBusExist = await this.busRepo.findOne({
                where: {
                    id: Not(id),
                    licensePlate: licensePlate
                }
            })

            if (isBusExist) {
                throw new ConflictException(`Biển số [${licensePlate}] đã được sử dụng bởi xe khác`);
            }
        }

        // 3. Tiến hành cập nhật
        await this.busRepo.update(
            { id: id },
            editBusDto
        )

        // 4. Lấy lại thông tin xe mới nhất sau khi cập nhật để trả về
        const updatedBus = await this.busRepo.findOne({ where: { id: id } });
        return updatedBus as any;
    }

    async deleteBus(id: number): Promise<void> {
        const bus = await this.busRepo.findOne({
            where: { id: id, deleted: false }
        });

        if (!bus) {
            throw new NotFoundException(`Không tìm thấy xe bus có ID [${id}]`);
        }

        await this.busRepo.update(
            { id: id },
            { deleted: true }
        )
    }
}
