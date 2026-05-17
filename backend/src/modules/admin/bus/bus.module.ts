import { Module } from '@nestjs/common';
import { BusService } from './bus.service';
import { BusController } from './bus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from 'src/database/entities/bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bus])],
  controllers: [BusController],
  providers: [BusService],
})
export class BusModule { }
