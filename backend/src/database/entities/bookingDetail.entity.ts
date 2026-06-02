import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
    OneToMany
} from 'typeorm'
import { Booking } from './booking.entity';
import { Seat } from './seat.entity';

@Entity('BookingDetails')
export class BookingDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'booking_id'})
    bookingId: number;

    @ManyToOne(() => Booking, (booking) => booking.bookingDetails)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @Column({name: 'seat_id'})
    seatId: number;

    @ManyToOne(() => Seat, (seat) => seat.bookingDetails)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat;

    // 🌟 THÀNH PHẦN MỚI: Giá vé thực tế tại thời điểm đặt (Bảo vệ tính đóng băng dữ liệu lịch sử)
    @Column({ type: 'int', default: 0 })
    price: number;
}