import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
const useAdditionalServices = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    //Инициализация состояния из URL параметров
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [optimisticPage, setOptimisticPage] = useState(page);
    const [perPage] = useState(Number(searchParams.get('per_page')) || 10);
    const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || null);
    const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');
    //Данные из API
    const [additionalServices, setAdditionalServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    //Функция получения данных с сервера
    const fetchAdditionalServices = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL('/api/additional-services', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('per_page', perPage.toString());
            if (sortBy !== null) {
                url.searchParams.append('sort_by', sortBy);
            }
            if (sortOrder) {
                url.searchParams.append('sort_order', sortOrder);
            }
            const response = await fetch(url.toString());
            if (!response.ok)
                throw new Error('Ошибка при загрузке данных');
            const { data } = await response.json();
            //Преобразуем данные в формат таблицы
            setAdditionalServices(data.additionalServices.map((service, index) => ({
                number: (optimisticPage - 1) * perPage + index + 1,
                uuid: service.uuid,
                name: service.name,
                createdAt: new Date(service.createdAt),
                updatedAt: new Date(service.updatedAt),
                actions: renderActions({
                    entity: 'additional-services',
                    uuid: service.uuid,
                    modalType: 'createAdditionalServiceModal',
                    navigate: router.push,
                }),
            })));
            setTotal(data.total);
            setError(null);
        }
        catch (error) {
            console.error('Ошибка загрузки:', error);
            setError('Ошибка загрузки данных');
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage, sortBy, sortOrder]);
    useEffect(() => {
        fetchAdditionalServices();
    }, [fetchAdditionalServices]);
    //Функция смены страницы
    const handlePageChange = (newPage) => {
        setOptimisticPage(newPage);
        setPage(newPage);
    };
    const handleSort = (sortByKey, sortDirection) => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
    };
    return {
        additionalServices,
        loading,
        error,
        total,
        optimisticPage,
        perPage,
        sortBy,
        sortOrder,
        handlePageChange,
        handleSort,
    };
};
export default useAdditionalServices;
