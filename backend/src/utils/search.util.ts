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
                let obj = { ...queryCondition };
                obj[field] = ILike(`%${trimmedKeyword}%`);
                finalWhereCondition.push(obj);
            })

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