import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { Route } from './route.entity';
import { Station } from './station.entity';

@Entity('Route_Stations')
export class RouteStation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'route_id'})
    routeId: number;

    @Column({name: 'station_id'})
    stationId: number;

    @Column({name: 'stop_order'})
    stopOrder: number; // 1: Trạm đầu, 2: Trạm giữa, 3: Trạm cuối...

    @Column({ type: 'float', nullable: true, name: 'distance_from_start' })
    distanceFromStart: number; // Khoảng cách từ trạm gốc (để tính tiền vé)

    @ManyToOne(() => Route, (route) => route.routeStations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'route_id' })
    route: Route;

    @ManyToOne(() => Station, (station) => station.routeStations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_id' })
    station: Station;
}
