import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm';
import { Bus } from './bus.entity';
import { Route } from './route.entity';
import { Seat } from './seat.entity';
import { Booking } from './booking.entity';

@Entity('Trips')
export class Trip {
    @PrimaryGeneratedColumn()
    id: number;

    // Quan hệ với bảng Route
    @ManyToOne(() => Route, (route) => route.trips)
    @JoinColumn({ name: 'routeId' }) // Tên cột khóa ngoại trong SQL Server
    route: Route;

    // Quan hệ với bảng Bus
    @ManyToOne(() => Bus, (bus) => bus.trips)
    @JoinColumn({ name: 'busId' })
    bus: Bus

    @Column({ type: 'datetime' })
    departureTime: Date;

    @Column({ type: 'datetime' })
    arrivalTime: Date;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    ticketPrice: number;

    @Column({ type: 'nvarchar', length: 50, default: 'scheduled' })
    status: string;

    @OneToMany(() => Seat, (seat) => seat.trip)
    seats: Seat[];

    @OneToMany(() => Booking, (booking) => booking.trip)
    bookings: Booking[];
}