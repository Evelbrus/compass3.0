//@pages/(driver)/orders/main/hooks/useDriverOrders.ts
import { useState, useEffect } from 'react';
const useClientCorpOrders = ({ 
//Убрали corpId
page, perPage, statusFilter, sortBy, sortOrder, updateFlag, updateURL, }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [statusesCount, setStatusesCount] = useState({});
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const url = new URL('/api/client-corp/orders', window.location.origin);
                url.searchParams.append('page', page.toString());
                url.searchParams.append('per_page', perPage.toString());
                if (statusFilter) {
                    url.searchParams.append('status', statusFilter);
                }
                url.searchParams.append('sort_by', sortBy);
                url.searchParams.append('sort_order', sortOrder);
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
                setError(null);
            }
            catch (error) {
                console.error('Error fetching orders:', error);
                setError('Error fetching orders');
            }
            finally {
                setLoading(false);
            }
        };
        fetchOrders();
        updateURL({ page, status: statusFilter, sortBy, sortOrder });
    }, [page, perPage, statusFilter, sortBy, sortOrder, updateFlag, updateURL]);
    return { orders, loading, error, total, statusesCount };
};
export default useClientCorpOrders;
