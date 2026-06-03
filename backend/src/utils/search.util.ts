import { Injectable } from "@nestjs/common";
import { ILike } from "typeorm";

@Injectable()
export class Search {
    search = (keyword: string, queryCondition: any, fields: string[]) => {
        //để tra ra lại cho frontend
        const searchResult = {
            keyword: ""
        };

        let finalWhereCondition: any = queryCondition;

        if (keyword) {
            const trimmedKeyword = keyword.trim();
            searchResult.keyword = trimmedKeyword;

            finalWhereCondition = [];
            fields.forEach(field => {
                // 1. Nhân bản điều kiện gốc (như deleted: false, status: 'active')
                let obj = { ...queryCondition };
                
                // 2. Tách chuỗi bằng dấu chấm (Ví dụ: "departureStation.name" -> ["departureStation", "name"])
                const parts = field.split('.');
                
                // 3. Dựng cấu trúc nested object lồng nhau một cách động
                let current = obj;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    
                    if (i === parts.length - 1) {
                        // Nếu là cấp cuối cùng (vị trí cần gán giá trị), nhét ILike vào
                        current[part] = ILike(`%${trimmedKeyword}%`);
                    } else {
                        // Nếu chưa phải cấp cuối, tạo object rỗng cho cấp tiếp theo (nếu chưa có)
                        // Và di chuyển con trỏ 'current' sâu vào trong 1 nấc
                        current[part] = current[part] ? { ...current[part] } : {};
                        current = current[part];
                    }
                }
                
                finalWhereCondition.push(obj);
            });

            // Tạo điều kiện OR trong TypeORM bằng cách truyền một mảng các object.
            // Mỗi object trong mảng OR phải thừa hưởng đầy đủ điều kiện lọc chung (deleted, status)
            // finalWhereCondition = [
            //     { ...queryCondition, licensePlate: ILike(`%${trimmedKeyword}%`) },
            //     { ...queryCondition, type: ILike(`%${trimmedKeyword}%`) },
            //     { ...queryCondition, model: ILike(`%${trimmedKeyword}%`) }
            // ];
        }

        return {
            searchResult,
            whereCondition: finalWhereCondition
        };
    }
}