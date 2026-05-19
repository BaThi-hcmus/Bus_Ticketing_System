export class Pagination {
    pagination = async (currentPage, queryCondition, repo) => {
        const paginationObject: any = {
            currentPage: 1,
            itemPerPage: 4
        }

        if (currentPage) paginationObject.currentPage = currentPage;

        //Số bản ghi trong table 
        const totalItems = await repo.count({
            where: queryCondition
        });
        paginationObject.totalItems = totalItems;
        paginationObject.totalPages = Math.ceil(totalItems / paginationObject.itemPerPage);

        paginationObject.startIndex = (paginationObject.currentPage - 1) * paginationObject.itemPerPage;

        return paginationObject;
    }
}         