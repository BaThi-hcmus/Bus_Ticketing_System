import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn
} from 'typeorm'
import { Trip } from './trip.entity';
import { RouteStation } from './routeStation.entity';

@Entity('Routes')
export class Route {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    departureLocation: string;

    @Column()
    destinationLocation: string;

    @Column()
    distanceKm: number;

    @Column()
    estimatedDuration: number;

    @Column({ default: "active" })
    status: string;

    @Column({ default: false })
    deleted: boolean;

    @CreateDateColumn({ type: 'date' })
    createdAt: Date;

    @OneToMany(() => Trip, (trip) => trip.route)
    trips: Trip[];

    @OneToMany(() => RouteStation, (routeStation) => routeStation.route, { cascade: true })
    routeStations: RouteStation[];
}