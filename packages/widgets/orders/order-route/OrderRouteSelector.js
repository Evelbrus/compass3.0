import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
const OrderStartEndSelector = ({ points, selectedDeparturePoint, selectedArrivalPoint, handleDepartureSelect, handleArrivalSelect, departurePointOptions, arrivalPointOptions, handleDepartureSearchChange, handleArrivalSearchChange, handleOpenSelect, departureSearch, arrivalSearch, loadMore, total, }) => {
    const { control, trigger, setValue } = useFormContext();
    const [isDepartureOpen, setIsDepartureOpen] = useState(false);
    const [isArrivalOpen, setIsArrivalOpen] = useState(false);
    //Для списка отправления
    const isLoadingDeparture = useRef(false);
    const lastPageLoadedDeparture = useRef(1);
    const loaderRefDeparture = useRef(null);
    //Для списка прибытия
    const isLoadingArrival = useRef(false);
    const lastPageLoadedArrival = useRef(1);
    const loaderRefArrival = useRef(null);
    //Определение, достигли ли конца списка отправления
    const isAtLastPageDeparture = useMemo(() => points && total > 0 && points.length >= total, [points, total]);
    //Определение, достигли ли конца списка прибытия
    const isAtLastPageArrival = useMemo(() => points && total > 0 && points.length >= total, [points, total]);
    //IntersectionObserver для списка отправления
    useEffect(() => {
        const observerCallback = (entries) => {
            const [entry] = entries;
            //Добавляем проверку на последнюю страницу
            if (entry.isIntersecting && !isLoadingDeparture.current && !isAtLastPageDeparture) {
                isLoadingDeparture.current = true;
                lastPageLoadedDeparture.current += 1;
                loadMore('departure');
            }
        };
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        if (loaderRefDeparture.current) {
            observer.observe(loaderRefDeparture.current);
        }
        return () => {
            if (loaderRefDeparture.current) {
                observer.unobserve(loaderRefDeparture.current);
            }
        };
    }, [loadMore, isAtLastPageDeparture]);
    //IntersectionObserver для списка прибытия
    useEffect(() => {
        const observerCallback = (entries) => {
            const [entry] = entries;
            //Добавляем проверку на последнюю страницу
            if (entry.isIntersecting && !isLoadingArrival.current && !isAtLastPageArrival) {
                isLoadingArrival.current = true;
                lastPageLoadedArrival.current += 1;
                loadMore('arrival');
            }
        };
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        if (loaderRefArrival.current) {
            observer.observe(loaderRefArrival.current);
        }
        return () => {
            if (loaderRefArrival.current) {
                observer.unobserve(loaderRefArrival.current);
            }
        };
    }, [loadMore, isAtLastPageArrival]);
    //Сброс состояния загрузки
    useEffect(() => {
        isLoadingDeparture.current = false;
        isLoadingArrival.current = false;
    }, [points]);
    //Обработка клика вне области селектора
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest('.departure-selector'))
                setIsDepartureOpen(false);
            if (!target.closest('.arrival-selector'))
                setIsArrivalOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    //Валидация выбранных точек
    const validateSelection = useCallback((selectedPoint, options, field) => {
        if (selectedPoint && !options.some((opt) => opt.value === selectedPoint.uuid)) {
            setValue(field, '');
            if (field === 'departurePoint') {
                handleDepartureSelect(null);
            }
            else {
                handleArrivalSelect(null);
            }
        }
    }, [setValue, handleDepartureSelect, handleArrivalSelect]);
    useEffect(() => {
        validateSelection(selectedDeparturePoint, departurePointOptions, 'departurePoint');
    }, [departurePointOptions, selectedDeparturePoint, validateSelection]);
    useEffect(() => {
        validateSelection(selectedArrivalPoint, arrivalPointOptions, 'arrivalPoint');
    }, [arrivalPointOptions, selectedArrivalPoint, validateSelection]);
    return (_jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "w-full relative departure-selector", children: [_jsx("label", { className: "block mb-2 text-5 leading-5 font-bold", children: "\u041E\u0442\u043A\u0443\u0434\u0430?" }), _jsx(Controller, { name: "departurePoint", control: control, rules: { required: 'Выберите точку отправления' }, render: ({ field, fieldState }) => (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: selectedDeparturePoint?.address || '', onClick: () => {
                                        handleOpenSelect();
                                        setIsDepartureOpen(true);
                                        setIsArrivalOpen(false);
                                    }, placeholder: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F", readOnly: true, className: `text-4 leading-4 p-3 w-full border rounded ${fieldState.error ? 'border-red-500' : 'border-gray-300'}` }), isDepartureOpen && (_jsxs("div", { className: "absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto", children: [_jsx("input", { type: "text", autoFocus: true, value: departureSearch, onChange: (e) => handleDepartureSearchChange(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "text-4 leading-4 p-3 w-full border-b" }), departurePointOptions.map((option) => (_jsx("div", { className: "px-3 py-2 cursor-pointer hover:bg-gray-100", onClick: () => {
                                                const point = points?.find((p) => p.uuid === option.value) || null;
                                                field.onChange(option.value);
                                                handleDepartureSelect(point);
                                                trigger('departurePoint');
                                                setIsDepartureOpen(false);
                                            }, children: option.label }, option.key))), !isAtLastPageDeparture && (_jsx("div", { ref: loaderRefDeparture, className: "p-2 text-center text-gray-500", children: isLoadingDeparture.current ? 'Загрузка...' : '' }))] })), fieldState.error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: fieldState.error.message }))] })) })] }), _jsxs("div", { className: "w-full relative arrival-selector", children: [_jsx("label", { className: "block mb-2 text-5 leading-5 font-bold", children: "\u041A\u0443\u0434\u0430?" }), _jsx(Controller, { name: "arrivalPoint", control: control, rules: { required: 'Выберите точку прибытия' }, render: ({ field, fieldState }) => (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: selectedArrivalPoint?.address || '', onClick: () => {
                                        handleOpenSelect();
                                        setIsArrivalOpen(true);
                                        setIsDepartureOpen(false);
                                    }, placeholder: "\u041F\u0440\u0438\u0431\u044B\u0442\u0438\u0435", readOnly: true, className: `text-4 leading-4 p-3 w-full border rounded ${fieldState.error ? 'border-red-500' : 'border-gray-300'}` }), isArrivalOpen && (_jsxs("div", { className: "absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto", children: [_jsx("input", { type: "text", autoFocus: true, value: arrivalSearch, onChange: (e) => handleArrivalSearchChange(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "text-4 leading-4 p-3 w-full border-b" }), arrivalPointOptions.map((option) => (_jsx("div", { onClick: () => {
                                                const point = points?.find((p) => p.uuid === option.value) || null;
                                                field.onChange(option.value);
                                                handleArrivalSelect(point);
                                                trigger('arrivalPoint');
                                                setIsArrivalOpen(false);
                                            }, className: "p-3 cursor-pointer hover:bg-gray-100", children: option.label }, option.key))), !isAtLastPageArrival && (_jsx("div", { ref: loaderRefArrival, className: "p-2 text-center text-gray-500", children: isLoadingArrival.current ? 'Загрузка...' : '' }))] })), fieldState.error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: fieldState.error.message }))] })) })] })] }));
};
export default OrderStartEndSelector;
