import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm'
import { Trip } from './trip.entity';

@Entity('Buses')
export class Bus {
    @PrimaryGeneratedColumn()   // khai báo khóa chính và tự động tăng
    id: number;

    @Column({ type: 'nvarchar', length: 20, unique: true })
    license_plate: string;

    @Column({ type: 'nvarchar', length: 50 })
    type: string;

    @Column({ type: 'decimal' })
    total_seats: number;

    @Column({ type: 'nvarchar', length: 50 })
    model: string;

    @CreateDateColumn({ type: 'date' })
    created_at: Date;

    @OneToMany(() => Trip, (trip) => trip.bus)
    trips: Trip[];
}