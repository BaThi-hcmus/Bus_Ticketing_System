export class BusDetailDto {
    id: number;
    licensePlate: string;
    type: string;
    totalSeats: number;
    model: string;
    createdAt: Date;
    status: string;
    trips?: any[]; // Mảng chứa thông tin các chuyến xe bus chạy
}
