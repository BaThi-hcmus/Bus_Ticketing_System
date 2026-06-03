import { Injectable } from "@nestjs/common";

@Injectable()
export class FilterStatus {
    filterStatus = (
        status, // status do frontend gửi đến
        queryCondition, // điều kiện lọc
        filterStatusList // danh sách tiêu chí lọc
    ) => {
        
        if (status) {
            const item = filterStatusList.find(item => {
                return item.status == status;
            })

            if (item) {
                filterStatusList.forEach(it => it.class = "");
                item.class = "active";
                queryCondition.status = status;
            }
        }

        return filterStatusList;
    }
}