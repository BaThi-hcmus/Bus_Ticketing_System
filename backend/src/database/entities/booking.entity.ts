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
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Trip, (trip) => trip.bookings)
    @JoinColumn({ name: 'tripId' })
    trip: Trip;

    @Column({ type: 'datetime' })
    bookingDate: Date;

    @Column({ type: 'decimal' })
    totalAmount: number;

    @Column({ type: 'nvarchar', length: 50 })
    paymentStatus: string;

    @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.booking)
    bookingDetails: BookingDetail[];
}