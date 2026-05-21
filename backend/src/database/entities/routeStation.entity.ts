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

    @Column()
    routeId: number;

    @Column()
    stationId: number;

    @Column()
    stopOrder: number; // 1: Trạm đầu, 2: Trạm giữa, 3: Trạm cuối...

    @Column({ type: 'float', nullable: true })
    distanceFromStart: number; // Khoảng cách từ trạm gốc (để tính tiền vé)

    @ManyToOne(() => Route, (route) => route.routeStations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routeId' })
    route: Route;

    @ManyToOne(() => Station, (station) => station.routeStations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stationId' })
    station: Station;
}
