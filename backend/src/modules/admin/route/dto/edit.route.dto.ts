export class EditRouteDto {
    departureLocation?: string;
    destinationLocation?: string;
    distanceKm?: number;
    estimatedDuration?: number;
    status?: string;
    deleted?: boolean;
    stations?: { stationId: number; distanceFromStart: number }[];
    routeGeometry?: string;
    waypoints?: string;
}
