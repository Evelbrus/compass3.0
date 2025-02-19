import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { usePoints } from '@features/orders/create/hooks';
import useDebounce from '@shared/utils/hooks/useDebounce';
import { showToast } from '@shared/components/toast/ToastManager';
export const useOrderCreatePoints = ({ setErrorMessage, departurePoint, arrivalPoint, additionalPointPrice, intermediatePoints: initialIntermediatePoints, }) => {
    const [departureSearch, setDepartureSearch] = useState('');
    const [arrivalSearch, setArrivalSearch] = useState('');
    const [intermediateSearches, setIntermediateSearches] = useState(Array(5).fill(''));
    const debouncedDepartureSearch = useDebounce(departureSearch, 500);
    const debouncedArrivalSearch = useDebounce(arrivalSearch, 500);
    const { points, refetchPoints, fetchPointsByUuidsCallback, total, loadMore, currentPage } = usePoints({
        setErrorMessage,
    });
    const lastSearchQuery = useRef('');
    const [selectedDeparturePoint, setSelectedDeparturePoint] = useState(null);
    const [selectedArrivalPoint, setSelectedArrivalPoint] = useState(null);
    const [selectedIntermediatePoints, setSelectedIntermediatePoints] = useState([]);
    const formMethods = useForm({
        defaultValues: {
            departurePoint: '',
            arrivalPoint: '',
            intermediatePoints: ['', '', '', '', ''],
        },
    });
    const { departurePoint: currentDeparturePoint, arrivalPoint: currentArrivalPoint, intermediatePoints: currentIntermediatePoints, } = formMethods.watch();
    const totalPointsCount = useMemo(() => {
        let count = 0;
        if (currentDeparturePoint)
            count++;
        if (currentArrivalPoint)
            count++;
        if (currentIntermediatePoints) {
            count += currentIntermediatePoints.filter(Boolean).length;
        }
        return count;
    }, [currentDeparturePoint, currentArrivalPoint, currentIntermediatePoints]);
    const totalAdditionalPointsPrice = useMemo(() => {
        const additionalPointsCount = totalPointsCount > 2 ? totalPointsCount - 2 : 0;
        const totalPrice = additionalPointsCount * (additionalPointPrice || 0);
        return `(${additionalPointsCount} доп. точек ${totalPrice}с)`;
    }, [totalPointsCount, additionalPointPrice]);
    const totalIntermediatePointsPrice = useMemo(() => {
        if (!currentIntermediatePoints)
            return 0;
        const intermediatePointsCount = currentIntermediatePoints.filter(Boolean).length;
        const totalPrice = intermediatePointsCount * (additionalPointPrice || 0);
        return `(${intermediatePointsCount} доп. точек ${totalPrice}с)`;
    }, [currentIntermediatePoints, additionalPointPrice]);
    const arrivalPointPrice = useMemo(() => {
        return selectedArrivalPoint ? parseFloat(selectedArrivalPoint.pricePerKm.toString()) || 0 : 0;
    }, [selectedArrivalPoint]);
    useEffect(() => {
        const fetchInitialPoints = async () => {
            const pointUuids = [
                departurePoint,
                arrivalPoint,
                ...(initialIntermediatePoints || []),
            ].filter((uuid) => uuid !== undefined);
            if (pointUuids.length > 0) {
                try {
                    const fetchedPoints = await fetchPointsByUuidsCallback(pointUuids);
                    if (fetchedPoints) {
                        const departure = fetchedPoints.find((p) => p.uuid === departurePoint);
                        const arrival = fetchedPoints.find((p) => p.uuid === arrivalPoint);
                        const intermediate = (initialIntermediatePoints || [])
                            .map((uuid) => fetchedPoints.find((p) => p.uuid === uuid))
                            .filter((p) => p !== undefined);
                        if (departure) {
                            setSelectedDeparturePoint(departure);
                            formMethods.setValue('departurePoint', departure.uuid);
                        }
                        if (arrival) {
                            setSelectedArrivalPoint(arrival);
                            formMethods.setValue('arrivalPoint', arrival.uuid);
                        }
                        if (intermediate.length > 0) {
                            setSelectedIntermediatePoints(intermediate);
                            formMethods.setValue('intermediatePoints', intermediate.map((p) => p.uuid));
                        }
                    }
                }
                catch (error) {
                    setErrorMessage(error, 'Ошибка загрузки начальных точек');
                }
            }
        };
        fetchInitialPoints();
    }, [
        departurePoint,
        arrivalPoint,
        initialIntermediatePoints,
        formMethods,
        fetchPointsByUuidsCallback,
        setErrorMessage,
    ]);
    const handleDepartureSelect = useCallback((point) => {
        const intermediatePoints = formMethods.getValues('intermediatePoints') || [];
        const arrivalPointValue = formMethods.getValues('arrivalPoint');
        if (point?.uuid === arrivalPointValue) {
            showToast.error('Точка отправления не может совпадать с точкой прибытия');
            return;
        }
        if (point && intermediatePoints.includes(point.uuid)) {
            showToast.error('Эта точка уже выбрана как промежуточная');
            return;
        }
        setSelectedDeparturePoint(point);
        formMethods.setValue('departurePoint', point?.uuid || '');
        if (point) {
            showToast.success(`Точка отправления ${point.address} выбрана`);
        }
    }, [formMethods]);
    const handleArrivalSelect = useCallback((point) => {
        const intermediatePoints = formMethods.getValues('intermediatePoints') || [];
        const departurePointValue = formMethods.getValues('departurePoint');
        if (point?.uuid === departurePointValue) {
            showToast.error('Точка прибытия не может совпадать с точкой отправления');
            return;
        }
        if (point && intermediatePoints.includes(point.uuid)) {
            showToast.error('Эта точка уже выбрана как промежуточная');
            return;
        }
        setSelectedArrivalPoint(point);
        formMethods.setValue('arrivalPoint', point?.uuid || '');
        if (point) {
            showToast.success(`Точка прибытия ${point.address} выбрана`);
        }
    }, [formMethods]);
    const handleIntermediatePointSelect = useCallback((index, point) => {
        const departurePointValue = formMethods.getValues('departurePoint');
        const arrivalPointValue = formMethods.getValues('arrivalPoint');
        if (point?.uuid === departurePointValue) {
            showToast.error('Промежуточная точка не может совпадать с точкой отправления');
            return;
        }
        if (point?.uuid === arrivalPointValue) {
            showToast.error('Промежуточная точка не может совпадать с точкой прибытия');
            return;
        }
        if (selectedIntermediatePoints.some((p) => p && p.uuid === point?.uuid)) {
            showToast.error('Эта точка уже выбрана как промежуточная');
            return;
        }
        const updatedSelectedIntermediatePoints = [...selectedIntermediatePoints];
        updatedSelectedIntermediatePoints[index] = point;
        const updatedIntermediatePointsUuids = updatedSelectedIntermediatePoints.map((p) => p?.uuid || '');
        setSelectedIntermediatePoints(updatedSelectedIntermediatePoints);
        formMethods.setValue('intermediatePoints', updatedIntermediatePointsUuids);
    }, [formMethods, selectedIntermediatePoints]);
    const handleClearIntermediatePoint = useCallback((index) => {
        const intermediatePoints = formMethods.getValues('intermediatePoints') || [];
        const updatedIntermediatePoints = [...intermediatePoints];
        updatedIntermediatePoints[index] = '';
        const newSelectedIntermediatePoints = updatedIntermediatePoints
            .map((uuid) => (uuid ? points?.find((p) => p.uuid === uuid) : null))
            .filter((p) => p !== null);
        setIntermediateSearches((prevSearches) => {
            const updatedSearches = [...prevSearches];
            updatedSearches[index] = '';
            return updatedSearches;
        });
        setSelectedIntermediatePoints(newSelectedIntermediatePoints);
        formMethods.setValue('intermediatePoints', newSelectedIntermediatePoints.map((p) => p.uuid));
    }, [formMethods, points]);
    const departurePointOptions = useMemo(() => {
        const options = [];
        if (selectedDeparturePoint) {
            options.push({
                label: selectedDeparturePoint.address,
                value: selectedDeparturePoint.uuid,
                key: `departure-${selectedDeparturePoint.uuid}`,
            });
        }
        const intermediatePoints = formMethods.getValues('intermediatePoints') || [];
        points?.forEach((point) => {
            if (point.uuid !== selectedDeparturePoint?.uuid &&
                point.uuid !== selectedArrivalPoint?.uuid &&
                !intermediatePoints.includes(point.uuid)) {
                options.push({
                    label: point.address,
                    value: point.uuid,
                    key: point.uuid,
                });
            }
        });
        return options.filter((option) => departureSearch ? option.label.toLowerCase().includes(departureSearch.toLowerCase()) : true);
    }, [points, selectedDeparturePoint, selectedArrivalPoint, departureSearch, formMethods]);
    const arrivalPointOptions = useMemo(() => {
        const options = [];
        if (selectedArrivalPoint) {
            options.push({
                label: selectedArrivalPoint.address,
                value: selectedArrivalPoint.uuid,
                key: `arrival-${selectedArrivalPoint.uuid}`,
            });
        }
        const intermediatePoints = formMethods.getValues('intermediatePoints') || [];
        points?.forEach((point) => {
            if (point.uuid !== selectedDeparturePoint?.uuid &&
                point.uuid !== selectedArrivalPoint?.uuid &&
                !intermediatePoints.includes(point.uuid)) {
                options.push({
                    label: point.address,
                    value: point.uuid,
                    key: point.uuid,
                });
            }
        });
        return options.filter((option) => arrivalSearch ? option.label.toLowerCase().includes(arrivalSearch.toLowerCase()) : true);
    }, [points, selectedDeparturePoint, selectedArrivalPoint, arrivalSearch, formMethods]);
    const intermediatePointOptions = useMemo(() => {
        return intermediateSearches.map((intermediateSearch) => {
            const options = [];
            const intermediatePoints = formMethods.getValues('intermediatePoints') || [];
            points?.forEach((point) => {
                if (point.uuid !== selectedDeparturePoint?.uuid &&
                    point.uuid !== selectedArrivalPoint?.uuid &&
                    !intermediatePoints.includes(point.uuid)) {
                    options.push({
                        label: point.address,
                        value: point.uuid,
                        key: point.uuid,
                    });
                }
            });
            return options.filter((option) => intermediateSearch
                ? option.label.toLowerCase().includes(intermediateSearch.toLowerCase())
                : true);
        });
    }, [points, selectedDeparturePoint, selectedArrivalPoint, intermediateSearches, formMethods]);
    const lastIntermediateSearchQueries = useRef(Array(5).fill(''));
    useEffect(() => {
        intermediateSearches.forEach((search, index) => {
            if (search !== undefined && search !== lastIntermediateSearchQueries.current[index]) {
                lastIntermediateSearchQueries.current[index] = search;
                refetchPoints(search);
            }
        });
    }, [intermediateSearches, refetchPoints]);
    useEffect(() => {
        if (debouncedDepartureSearch !== undefined &&
            debouncedDepartureSearch !== lastSearchQuery.current) {
            lastSearchQuery.current = debouncedDepartureSearch;
            refetchPoints(debouncedDepartureSearch);
        }
    }, [debouncedDepartureSearch, refetchPoints]);
    useEffect(() => {
        if (debouncedArrivalSearch !== undefined &&
            debouncedArrivalSearch !== lastSearchQuery.current) {
            lastSearchQuery.current = debouncedArrivalSearch;
            refetchPoints(debouncedArrivalSearch);
        }
    }, [debouncedArrivalSearch, refetchPoints]);
    const handleDepartureSearchChange = useCallback((value) => {
        setDepartureSearch(value);
    }, []);
    const handleArrivalSearchChange = useCallback((value) => {
        setArrivalSearch(value);
    }, []);
    const handleIntermediateSearchChange = useCallback((value, index) => {
        setIntermediateSearches((prevSearches) => {
            const updatedSearches = [...prevSearches];
            updatedSearches[index] = value;
            return updatedSearches;
        });
    }, []);
    const handleOpenSelect = useCallback((index) => {
        setIntermediateSearches((prevSearches) => prevSearches.map((_, i) => (i === index ? prevSearches[i] : '')));
        refetchPoints('');
        setDepartureSearch('');
        setArrivalSearch('');
    }, [refetchPoints]);
    return {
        points,
        refetchPoints,
        selectedDeparturePoint,
        selectedArrivalPoint,
        selectedIntermediatePoints,
        handleDepartureSelect,
        handleArrivalSelect,
        handleIntermediatePointSelect,
        handleClearIntermediatePoint,
        formMethods,
        departurePointOptions,
        arrivalPointOptions,
        intermediatePointOptions,
        handleDepartureSearchChange,
        handleArrivalSearchChange,
        handleIntermediateSearchChange,
        handleOpenSelect,
        departureSearch,
        arrivalSearch,
        intermediateSearches,
        total,
        loadMore,
        currentPage,
        totalAdditionalPointsPrice,
        arrivalPointPrice,
        totalIntermediatePointsPrice,
    };
};
