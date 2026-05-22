import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm'
import { RouteStation } from './routeStation.entity';

@Entity('Stations')
export class Station {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
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

    @CreateDateColumn({ type: 'date' })
    createdAt: Date;

    @OneToMany(() => RouteStation, (routeStation) => routeStation.station)
    routeStations: RouteStation[];
}
