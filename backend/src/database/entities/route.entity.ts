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
    departureLocation: string;

    @Column()
    destinationLocation: string;

    @Column()
    distanceKm: number;

    @Column()
    estimatedDuration: number;

    @OneToMany(() => Trip, (trip) => trip.route)
    trips: Trip[];
}