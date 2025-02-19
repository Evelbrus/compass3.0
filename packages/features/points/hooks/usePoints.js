import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
const usePoints = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    //📌 Инициализация состояния из URL параметров
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [optimisticPage, setOptimisticPage] = useState(page);
    const [perPage] = useState(Number(searchParams.get('per_page')) || 10);
    const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || null);
    const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');
    //📌 Данные из API
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    //📌 Функция загрузки точек с сервера
    const fetchPoints = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL('/api/points', window.location.origin);
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
            setPoints(data.points.map((point, index) => ({
                number: (optimisticPage - 1) * perPage + index + 1,
                uuid: point.uuid,
                address: point.address,
                pricePerKm: Number(point.pricePerKm) + '\u00A0сом',
                terrainDifficulty: Number(point.terrainDifficulty),
                latitude: Number(point.latitude),
                longitude: Number(point.longitude),
                airport: point.airport,
                createdAt: new Date(point.createdAt),
                updatedAt: new Date(point.updatedAt),
                actions: renderActions({
                    entity: 'points',
                    uuid: point.uuid,
                    modalType: 'createPointModal',
                    navigate: router.push,
                }),
            })));
            setTotal(data.total);
            setError(null);
        }
        catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            setError('Ошибка загрузки данных');
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage, sortBy, sortOrder, router]);
    useEffect(() => {
        fetchPoints();
    }, [fetchPoints]);
    //📌 Функции для смены страницы и сортировки
    const handlePageChange = (newPage) => {
        setOptimisticPage(newPage);
        setPage(newPage);
    };
    const handleSort = (sortByKey, sortDirection) => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
    };
    return {
        points,
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
export default usePoints;
