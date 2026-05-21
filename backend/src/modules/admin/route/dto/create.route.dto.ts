export class CreateRouteDto {
    departureLocation: string;
    destinationLocation: string;
    distanceKm: number;
    estimatedDuration: number;
    stations: { stationId: number; distanceFromStart: number }[];
}
