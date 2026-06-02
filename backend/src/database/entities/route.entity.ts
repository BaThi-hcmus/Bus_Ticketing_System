import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Trip } from './trip.entity';
import { RouteStation } from './routeStation.entity';
import { Station } from './station.entity'; 

export enum RouteStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    INACTIVE = 'inactive',
}

@Entity('Routes')
export class Route {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'nvarchar', length: 255 })
    name: string;

    @Column({ type: 'int', name: 'departure_station_id' })
    departureStationId: number;

    @Column({ type: 'int', name: 'destination_station_id' })
    destinationStationId: number;

    // 🌟 Thay vì lưu String, hãy liên kết trực tiếp tới Trạm Đầu và Trạm Cuối
    @ManyToOne(() => Station)
    @JoinColumn({ name: 'departure_station_id' })
    departureStation: Station;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'destination_station_id' })
    destinationStation: Station;

    @Column({ type: 'int', name: 'distance_km' }) // Khoảng cách tính bằng Km 
    distanceKm: number;

    @Column({ type: 'int', name: 'estimated_duration_min' }) // 🌟 Quy ước: Thời gian di chuyển dự kiến tính bằng PHÚT
    estimatedDurationMin: number;

    @Column({
        type: 'nvarchar',
        length: 20,
        enum: RouteStatus,
        default: RouteStatus.ACTIVE
    })
    status: RouteStatus;

    @Column({ default: false })
    deleted: boolean;

    @Column({ type: 'text', nullable: true, name: 'route_geometry' })
    routeGeometry: string;

    @Column({ type: 'text', nullable: true })
    waypoints: string;

    @CreateDateColumn({ type: 'datetime2', name: 'created_at' }) // 🌟 Lưu đầy đủ ngày giờ phút giây chính xác
    createdAt: Date;

    @OneToMany(() => Trip, (trip) => trip.route)
    trips: Trip[];

    @OneToMany(() => RouteStation, (routeStation) => routeStation.route, { cascade: true })
    routeStations: RouteStation[];
}