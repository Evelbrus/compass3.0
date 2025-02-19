import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { fetchPoints, } from '@shared/components/modal/create-client-corp-order/api/useApi';
const PER_PAGE = '10';
const SORT_BY = 'createdAt';
const SORT_ORDER = 'asc';
/**
 * Функция для преобразования данных, полученных с API, в тип Point.
 */
const transformPoint = (point) => {
    return {
        ...point,
        pricePerKm: Number(point.pricePerKm),
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        terrainDifficulty: Number(point.terrainDifficulty),
        airport: point.airport,
        createdAt: new Date(point.createdAt),
        updatedAt: new Date(point.updatedAt),
    };
};
const usePointSelector = ({ initialPoints = [], selectedPoint: initialSelectedPoint = null, mode = 'single', initialSelectedPoints = [], additionalPointPrice, } = {}) => {
    //Состояния для работы селектора точек
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [search, setSearch] = useState('');
    const [points, setPoints] = useState(initialPoints);
    const [filteredPoints, setFilteredPoints] = useState(initialPoints);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    //Состояния выбранных точек
    const [selectedPoint, setSelectedPoint] = useState(initialSelectedPoint);
    const [selectedPoints, setSelectedPoints] = useState(initialSelectedPoints);
    const selectorRef = useRef(null);
    const observerRef = useRef(null);
    const onOpenSelect = useCallback(() => {
        setSearch('');
        setSearchValue('');
        setIsOpen(true);
    }, []);
    const onSearchValueChange = useCallback((value) => {
        setSearchValue(value);
    }, []);
    const handleSearchChange = useCallback((e) => {
        setSearch(e.target.value);
    }, []);
    const onSelectPoint = useCallback((point, index) => {
        if (mode === 'single') {
            setSelectedPoint(point);
            setSearchValue(point.address);
            setIsOpen(false);
        }
        else if (typeof index === 'number') {
            setSelectedPoints((prev) => {
                const newPoints = [...prev];
                newPoints[index] = point;
                return newPoints;
            });
            setIsOpen(false);
        }
    }, [mode]);
    const onRemovePoint = useCallback((index) => {
        if (mode === 'multiple') {
            setSelectedPoints((prev) => {
                const newPoints = [...prev];
                newPoints[index] = null;
                return newPoints;
            });
        }
    }, [mode]);
    //Загрузка списка точек при открытии селектора
    useEffect(() => {
        if (!isOpen)
            return;
        setLoading(true);
        fetchPoints(search, '1', PER_PAGE, SORT_BY, SORT_ORDER)
            .then((response) => {
            const mappedPoints = response.points.map(transformPoint);
            setPoints(mappedPoints);
            setFilteredPoints(mappedPoints);
            setPage(response.page);
            setTotal(response.total);
            console.log('Список точек успешно загружен.');
        })
            .catch((error) => {
            console.error('Ошибка при получении списка точек:', error);
        })
            .finally(() => setLoading(false));
    }, [search, isOpen]);
    //Подгрузка следующих страниц через IntersectionObserver
    useEffect(() => {
        if (!isOpen || !observerRef.current)
            return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !loading && points.length < total) {
                    setLoading(true);
                    fetchPoints(search, (page + 1).toString(), PER_PAGE, SORT_BY, SORT_ORDER)
                        .then((response) => {
                        if (response.points.length > 0) {
                            const newPoints = response.points.map(transformPoint);
                            setPoints((prev) => [...prev, ...newPoints]);
                            setFilteredPoints((prev) => [...prev, ...newPoints]);
                            setPage(response.page);
                            console.log('Дополнительные точки загружены.');
                        }
                    })
                        .catch((error) => {
                        console.error('Ошибка при загрузке дополнительных точек:', error);
                    })
                        .finally(() => setLoading(false));
                }
            });
        });
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [search, page, loading, points, total, isOpen]);
    const onChangeOrder = useCallback((currentIndex, newIndex) => {
        setSelectedPoints((prev) => {
            const newPoints = [...prev];
            const currentPoint = newPoints[currentIndex] ?? null;
            newPoints.splice(currentIndex, 1);
            newPoints.splice(newIndex, 0, currentPoint);
            return newPoints;
        });
    }, []);
    //Закрытие селектора при клике вне его области
    useEffect(() => {
        if (!isOpen)
            return;
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    const totalAdditionalPrice = useMemo(() => {
        if (mode !== 'multiple' || !additionalPointPrice)
            return 0;
        return selectedPoints.filter((point) => point !== null).length * additionalPointPrice;
    }, [selectedPoints, additionalPointPrice, mode]);
    return {
        isOpen,
        searchValue,
        search,
        filteredPoints,
        loading,
        onOpenSelect,
        onSearchValueChange,
        handleSearchChange,
        onSelectPoint,
        selectorRef,
        observerRef,
        onChangeOrder,
        selectedPoint: mode === 'single' ? selectedPoint : undefined,
        selectedPoints: mode === 'multiple' ? selectedPoints : undefined,
        onRemovePoint: mode === 'multiple' ? onRemovePoint : undefined,
        totalAdditionalPrice,
    };
};
export default usePointSelector;
