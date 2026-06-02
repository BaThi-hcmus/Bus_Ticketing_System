import { ConflictException } from '@nestjs/common';

export class Sort {
    sort = (sortType: string, sortList: any[]): any => {
        // 1. Mặc định sắp xếp theo thời gian tạo mới nhất nếu không truyền sortType
        if (!sortType) {
            return { createdAt: "DESC", id: "DESC" };
        }

        // 2. Lấy ra danh sách các path hợp lệ được phép sort (Ví dụ: ['departureStation.name', 'distanceKm'])
        const validPaths = sortList.map(item => item.type.split("-")[0]);

        const arr = sortType.split("-");
        const rawPath = arr[0];        // Ví dụ: 'departureStation.name' hoặc 'distanceKm'
        const directionRaw = arr[1];   // 'src' hoặc 'desc'

        // 3. Kiểm tra tính hợp lệ của tiêu chí sort
        if (!validPaths.includes(rawPath)) {
            throw new ConflictException('Tiêu chí sort không hợp lệ');
        }

        // 4. Ánh xạ hướng sắp xếp
        const direction: "ASC" | "DESC" = directionRaw === "desc" ? "DESC" : "ASC";

        const sortObject: any = {};

        // 🌟 5. LOGIC ĐỈNH CAO: Biến chuỗi "a.b.c" thành Object lồng nhau { a: { b: { c: direction } } }
        const fields = rawPath.split('.'); // Nếu là 'departureStation.name' -> ['departureStation', 'name']
        
        let currentLevel = sortObject;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (i === fields.length - 1) {
                // Nếu đã đi đến tầng cuối cùng (ví dụ: 'name'), gán hướng sort vào
                currentLevel[field] = direction;
            } else {
                // Nếu chưa phải tầng cuối, tạo một Object rỗng lồng vào và dịch chuyển con trỏ đi xuống
                currentLevel[field] = {};
                currentLevel = currentLevel[field];
            }
        }

        // 6. Thêm id làm tiebreaker để đảm bảo thứ tự ổn định khi phân trang
        // Chỉ thêm nếu tầng ngoài cùng không phải là trường id
        if (fields[0] !== 'id') {
            sortObject['id'] = direction;
        }

        return sortObject;
    }
}