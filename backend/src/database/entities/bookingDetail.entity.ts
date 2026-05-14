import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToOne
} from 'typeorm'
import { Booking } from './booking.entity';
import { Seat } from './seat.entity';

@Entity('BookingDetails')
export class BookingDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.booking_details)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @OneToOne(() => Seat, (seat) => seat.booking_detail)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat;
}