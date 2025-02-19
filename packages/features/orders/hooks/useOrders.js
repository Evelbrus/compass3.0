import { useState, useEffect, useCallback } from 'react';
import { renderOrdersActions } from '@shared/components/ui/table/ui/TableRenders';
import { useRouter, useSearchParams } from 'next/navigation';
import { orderStatusTranslations } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
const useOrders = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    //Состояния
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [perPage] = useState(Number(searchParams.get('per_page')) || 10);
    //Инициализация состояния с параметрами URL
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [optimisticPage, setOptimisticPage] = useState(page);
    //Для сортировки и фильтрации
    const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || null);
    const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    //Состояния для вывода данных
    const [total, setTotal] = useState(0);
    const [statusesCount, setStatusesCount] = useState({});
    //Функция для получения данных с сервера
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL('/api/orders', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('per_page', perPage.toString());
            if (statusFilter !== 'all') {
                url.searchParams.append('status', statusFilter);
            }
            if (sortBy !== null) {
                url.searchParams.append('sort_by', sortBy);
            }
            if (sortOrder) {
                url.searchParams.append('sort_order', sortOrder);
            }
            url.searchParams.append('role', 'Driver');
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setOrders(data.orders);
            setTotal(data.total);
            const statusesCountData = {};
            data.statusesCount.forEach((item) => {
                statusesCountData[item.status] = item._count.status;
            });
            setStatusesCount(statusesCountData);
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            setError('Error fetching orders');
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage, statusFilter, sortBy, sortOrder]);
    //Вызов функции fetchOrders при изменении зависимостей
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    //Функции для изменения страницы и сортировки
    const handlePageChange = (newPage) => {
        setOptimisticPage(newPage);
        setPage(newPage);
    };
    const handleSort = (sortByKey, sortDirection) => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
    };
    //Обработчик изменения фильтра статуса с сбросом страницы
    const handleStatusFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
        setOptimisticPage(1);
    };
    //Маппинг данных
    const tableData = orders.map((order, index) => ({
        number: (optimisticPage - 1) * perPage + index + 1,
        createdBy: {
            fullName: order.createdBy.fullName,
            phone: order.createdBy.phone,
        },
        tariff: {
            name: order.tariff.name,
        },
        departurePoint: {
            address: order.departurePoint.address,
        },
        arrivalPoint: {
            address: order.arrivalPoint.address,
        },
        status: orderStatusTranslations[order.status],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        basePrice: parseFloat(order.basePrice.toString()),
        actions: renderOrdersActions({
            entity: 'orders',
            uuid: order.uuid,
            navigate: router.push,
        }),
    }));
    return {
        orders: tableData,
        loading,
        error,
        total,
        optimisticPage,
        perPage,
        sortBy,
        sortOrder,
        statusesCount,
        statusFilter,
        handleStatusFilterChange,
        handlePageChange,
        handleSort,
    };
};
export default useOrders;
