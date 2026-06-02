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

    @Column({ type: 'int' })
    departureStationId: number;

    @Column({ type: 'int' })
    destinationStationId: number;

    // 🌟 Thay vì lưu String, hãy liên kết trực tiếp tới Trạm Đầu và Trạm Cuối
    @ManyToOne(() => Station)
    @JoinColumn({ name: 'departureStationId' })
    departureStation: Station;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'destinationStationId' })
    destinationStation: Station;

    @Column({ type: 'int' }) // Khoảng cách tính bằng Km 
    distanceKm: number;

    @Column({ type: 'int' }) // 🌟 Quy ước: Thời gian di chuyển dự kiến tính bằng PHÚT
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

    @Column({ type: 'text', nullable: true })
    routeGeometry: string;

    @Column({ type: 'text', nullable: true })
    waypoints: string;

    @CreateDateColumn({ type: 'datetime2' }) // 🌟 Lưu đầy đủ ngày giờ phút giây chính xác
    createdAt: Date;

    @OneToMany(() => Trip, (trip) => trip.route)
    trips: Trip[];

    @OneToMany(() => RouteStation, (routeStation) => routeStation.route, { cascade: true })
    routeStations: RouteStation[];
}