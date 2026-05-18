import { Injectable } from "@nestjs/common";

@Injectable()
export class FilterStatus {
    filterStatus = (status, queryCondition) => {
        const filterStatusObject = [
            {
                name: "Tấc cả",
                status: "",
                class: "active"
            },
            {
                name: "Hoạt động",
                status: "active",
                class: ""
            },
            {
                name: "Dừng hoạt động",
                status: "inactive",
                class: ""
            }
        ]

        if (status) {
            const item = filterStatusObject.find(item => {
                return item.status == status;
            })

            if (item) {
                filterStatusObject.forEach(it => it.class = "");
                item.class = "active";
                queryCondition.status = status;
            }
        }

        return filterStatusObject;
    }
}