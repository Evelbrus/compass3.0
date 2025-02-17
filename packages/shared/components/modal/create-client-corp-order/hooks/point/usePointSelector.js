import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { fetchPoints, } from '@shared/components/modal/create-client-corp-order/api/useApi';
const PER_PAGE = '10';
const SORT_BY = 'createdAt';
const SORT_ORDER = 'asc';
/**
 * Функция для преобразования данных с API к типу Point.
 */
const transformPoint = (point) => {
    return {
        ...point,
        basePrice: Number(point.basePrice),
        createdAt: new Date(point.createdAt),
        updatedAt: new Date(point.updatedAt),
    };
};
const usePointSelector = ({ initialPoints = [], selectedPoint: initialSelectedPoint = null, mode = 'single', initialSelectedPoints = [], additionalPointPrice, } = {}) => {
    //Состояния для работы селектора адресов
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
    /**
     * При выборе адреса:
     * - В режиме 'single' сохраняем выбранную точку и закрываем селектор.
     * - В режиме 'multiple' ожидаем индекс ячейки для обновления.
     */
    const onSelectPoint = useCallback((point, index) => {
        if (mode === 'single') {
            setSelectedPoint(point);
            setSearchValue(point.address);
            setIsOpen(false);
        }
        else {
            if (typeof index === 'number') {
                setSelectedPoints((prev) => {
                    const newPoints = [...prev];
                    newPoints[index] = point;
                    return newPoints;
                });
                setIsOpen(false);
            }
        }
    }, [mode]);
    /**
     * Функция для удаления точки (режим multiple).
     */
    const onRemovePoint = useCallback((index) => {
        if (mode === 'multiple') {
            setSelectedPoints((prev) => {
                const newPoints = [...prev];
                newPoints[index] = null;
                return newPoints;
            });
        }
    }, [mode]);
    //Получение списка точек при открытии селектора
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
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search, isOpen]);
    //Подгрузка следующих страниц через IntersectionObserver
    useEffect(() => {
        if (!isOpen)
            return;
        if (!observerRef.current)
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
                        }
                    })
                        .catch(console.error)
                        .finally(() => setLoading(false));
                }
            });
        });
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [search, page, loading, points, total, isOpen]);
    const onChangeOrder = (currentIndex, newIndex) => {
        setSelectedPoints((prev) => {
            const newPoints = [...prev];
            //Меняем местами элементы
            const temp = newPoints[newIndex];
            newPoints[newIndex] = newPoints[currentIndex];
            newPoints[currentIndex] = temp;
            return newPoints;
        });
    };
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
    //Вычисляем общую цену для дополнительных точек
    const totalAdditionalPrice = useMemo(() => {
        //Если режим не multiple или не передана цена — возвращаем 0
        if (mode !== 'multiple' || !additionalPointPrice)
            return 0;
        const count = selectedPoints.filter((point) => point !== null).length;
        return count * additionalPointPrice;
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
        //Возвращаем выбранную точку (для single) или массив точек (для multiple)
        selectedPoint: mode === 'single' ? selectedPoint : undefined,
        selectedPoints: mode === 'multiple' ? selectedPoints : undefined,
        onRemovePoint: mode === 'multiple' ? onRemovePoint : undefined,
        //Добавляем общую цену для дополнительных точек
        totalAdditionalPrice,
    };
};
export default usePointSelector;
