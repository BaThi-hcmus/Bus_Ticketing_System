import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm'
import { User } from './user.entity';
import { Trip } from './trip.entity';
import { BookingDetail } from './bookingDetail.entity';

@Entity('Bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Trip, (trip) => trip.bookings)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column({ type: 'datetime' })
    booking_date: Date;

    @Column({ type: 'decimal' })
    total_amount: number;

    @Column({ type: 'nvarchar', length: 50 })
    payment_status: string;

    @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.booking)
    booking_details: BookingDetail[];
}