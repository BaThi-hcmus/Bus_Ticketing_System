import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
    OneToMany
} from 'typeorm'
import { Trip } from './trip.entity';
import { BookingDetail } from './bookingDetail.entity';

@Entity('Seats')
export class Seat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'trip_id'})
    tripId: number;

    //khóa ngoại tới Trip
    @ManyToOne(() => Trip, (trip) => trip.seats)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column({ type: 'nvarchar', length: 50, name: 'seat_number' })
    seatNumber: string;

    @Column({ default: true, name: 'is_available' })
    isAvailable: boolean;

    @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.seat)
    bookingDetails: BookingDetail[];
}