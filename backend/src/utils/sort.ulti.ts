import { ConflictException, Injectable } from "@nestjs/common";

@Injectable()
export class Sort {
    sort = (sortType: string, sortList: any[]) => {
        // Mặc định sắp xếp theo thời gian tạo mới nhất nếu không truyền sortType
        if (!sortType) {
            return { createdAt: "DESC", id: "DESC" };
        }

        // Lấy ra các field hợp lệ từ item.type 
        const fields: string[] = [];
        sortList.forEach((item) => {
            fields.push(item.type.split("-")[0]);
        });

        const arr = sortType.split("-");
        const field = arr[0];
        const directionRaw = arr[1];

        // Nếu trường sắp xếp không nằm trong các trường cho phép
        if (!fields.includes(field)) {
            throw new ConflictException('Tiêu chí sort không hợp lệ');
        }

        // Ánh xạ hướng sắp xếp chuẩn SQL (TypeORM chỉ hiểu ASC hoặc DESC)
        // src -> ASC, desc/dest -> DESC
        let direction: "ASC" | "DESC" = "ASC";
        if (directionRaw === "desc") {
            direction = "DESC";
        }

        const sortObject: any = {};
        sortObject[field] = direction;
        // Thêm id làm tiebreaker để đảm bảo thứ tự ổn định cho phân trang
        if (field !== 'id') {
            sortObject['id'] = direction;
        }

        return sortObject;
    }
}