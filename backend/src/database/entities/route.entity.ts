import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany
} from 'typeorm'
import { Trip } from './trip.entity';

@Entity('Routes')
export class Route {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    departure_location: string;

    @Column()
    destination_location: string;

    @Column()
    distance_km: number;

    @Column()
    estimated_duration: number;

    @OneToMany(() => Trip, (trip) => trip.route)
    trips: Trip[];
}