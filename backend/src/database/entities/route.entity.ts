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

    // Chuỗi mã hóa đường đi (Polyline từ OSRM)
    @Column({ type: 'text', nullable: true })
    routeGeometry: string;

    // Chuỗi JSON lưu danh sách các điểm kéo thả (waypoints) để vẽ lại đường đi
    @Column({ type: 'text', nullable: true })
    waypoints: string;

    @CreateDateColumn({ type: 'date' })
    createdAt: Date;

    @OneToMany(() => Trip, (trip) => trip.route)
    trips: Trip[];

    @OneToMany(() => RouteStation, (routeStation) => routeStation.route, { cascade: true })
    routeStations: RouteStation[];
}