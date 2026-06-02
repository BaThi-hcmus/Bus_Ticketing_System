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

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

@Entity('Bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'trip_id' })
    tripId: number;

    @ManyToOne(() => Trip, (trip) => trip.bookings)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column({ type: 'datetime2', name: 'booking_date', default: () => 'GETDATE()' })
    bookingDate: Date;

    @Column({ type: 'decimal', name: 'total_amount' })
    totalAmount: number;

    @Column({ 
        type: 'nvarchar', 
        length: 20, 
        name: 'payment_status',
        default: PaymentStatus.PENDING 
    })
    paymentStatus: string;

    @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.booking)
    bookingDetails: BookingDetail[];
}