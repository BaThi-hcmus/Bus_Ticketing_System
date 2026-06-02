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

export enum TripStatus {
    SCHEDULED = 'scheduled',   // Chuyến xe đã lên lịch thành công, hệ thống mở bán vé công khai.
    DEPARTED = 'departed',     // Xe đã chính thức xuất phát, rời bến (thường sẽ đóng cổng bán vé online).
    ARRIVED = 'arrived',       // Xe đã hoàn thành hành trình, cập bến an toàn.
    CANCELLED = 'cancelled',   // Chuyến xe bị hủy (do bão lũ, hỏng hóc xe đột xuất, không đủ khách...).
    DELAYED = 'delayed'        // Chuyến xe bị hoãn giờ khởi hành so với dự kiến ban đầu.
}

@Entity('Trips')
export class Trip {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'route_id'})
    routeId: number;

    // Quan hệ với bảng Route
    @ManyToOne(() => Route, (route) => route.trips)
    @JoinColumn({ name: 'route_id' }) // Tên cột khóa ngoại trong SQL Server
    route: Route;

    @Column({name: 'bus_id'})
    busId: number;

    // Quan hệ với bảng Bus
    @ManyToOne(() => Bus, (bus) => bus.trips)
    @JoinColumn({ name: 'bus_id' })
    bus: Bus

    @Column({ type: 'datetime2', name: 'departure_time' })
    departureTime: Date;

    @Column({ type: 'datetime2', name: 'arrival_time' })
    arrivalTime: Date;

    @Column({ type: 'int', name: 'ticket_price' })
    ticketPrice: number;

    @Column({ 
        type: 'nvarchar', 
        length: 20, 
        name: 'status', 
        default: TripStatus.SCHEDULED 
    })
    status: string;

    @OneToMany(() => Seat, (seat) => seat.trip)
    seats: Seat[];

    @OneToMany(() => Booking, (booking) => booking.trip)
    bookings: Booking[];
}