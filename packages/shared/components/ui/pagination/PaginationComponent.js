import { jsx as _jsx } from "react/jsx-runtime";
import Pagination from '@shared/components/ui/pagination/Pagination';
const PaginationComponent = ({ pageNumber, pageSize, totalCount, setPageNumber, }) => {
    return (totalCount > 10 && (_jsx(Pagination, { pageNumber: pageNumber, pageSize: pageSize, totalCount: totalCount, setPageNumber: setPageNumber })));
};
export default PaginationComponent;
