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

    @CreateDateColumn({ type: 'date' })
    createdAt: Date;

    @OneToMany(() => RouteStation, (routeStation) => routeStation.station)
    routeStations: RouteStation[];
}
