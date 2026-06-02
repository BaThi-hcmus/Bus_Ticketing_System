import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm'
import { Trip } from './trip.entity';

export enum BusStatus {
    ACTIVE = 'active',
    MAINTENANCE = 'maintenance',
    ON_TRIP = 'on_trip',
    INACTIVE = 'inactive',
  }

@Entity('Buses')
export class Bus {
    @PrimaryGeneratedColumn()   // khai báo khóa chính và tự động tăng
    id: number;

    @Column({ type: 'nvarchar', length: 20, unique: true, name: 'license_plate' })
    licensePlate: string;

    @Column({type: 'nvarchar'})
    type: string;

    @Column({ type: 'int', name: 'total_seats' })
    totalSeats: number;

    @Column({ type: 'nvarchar', length: 50 })
    model: string;

    @CreateDateColumn({ type: 'datetime2', name: 'created_at' })
    createdAt: Date;

    @Column({ default: false })
    deleted: boolean;

    @Column({ 
        type: 'nvarchar', 
        length: 50,
        enum: BusStatus,
        default: BusStatus.ACTIVE
    })
    status: string;

    @OneToMany(() => Trip, (trip) => trip.bus)
    trips: Trip[];
}