import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToOne
} from 'typeorm'
import { Trip } from './trip.entity';
import { BookingDetail } from './bookingDetail.entity';

@Entity('Seats')
export class Seat {
    @PrimaryGeneratedColumn()
    id: string;

    //khóa ngoại tới Trip
    @ManyToOne(() => Trip, (trip) => trip.seats)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column({ type: 'nvarchar', length: 50 })
    seatNumber: number;

    @Column({ default: true })
    isAvailable: boolean;

    @OneToOne(() => BookingDetail, (bookingDetail) => bookingDetail.seat)
    bookingDetail: BookingDetail;
}