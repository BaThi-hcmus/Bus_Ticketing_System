import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm'
import { RouteStation } from './routeStation.entity';
import { Route } from './route.entity';

@Entity('Stations')
export class Station {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'nvarchar', length: 255})
    name: string;

    @Column({ type: 'nvarchar', length: 500})
    address: string;

    @Column({ default: false })
    deleted: boolean;

    @Column({ default: 'active' })
    status: string;

    // Tọa độ Vĩ độ (Latitude)
    @Column({ type: 'float', nullable: true })
    lat: number;

    // Tọa độ Kinh độ (Longitude)
    @Column({ type: 'float', nullable: true })
    lng: number;

    @CreateDateColumn({ type: 'datetime2' })
    createdAt: Date;

    @OneToMany(() => RouteStation, (routeStation) => routeStation.station)
    routeStations: RouteStation[];

    @OneToMany(() => Route, (route) => route.departureStation)
    departureRoutes: Route[]; // Danh sách các tuyến lấy trạm này làm điểm xuất phát

    @OneToMany(() => Route, (route) => route.destinationStation)
    destinationRoutes: Route[]; // Danh sách các tuyến lấy trạm này làm điểm kết thúc
}
