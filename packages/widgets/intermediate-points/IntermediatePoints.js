import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
const IntermediatePoints = ({ selectedIntermediatePoints, intermediatePointOptions, handleIntermediatePointSelect, handleClearIntermediatePoint, handleIntermediateSearchChange, handleOpenSelect, intermediateSearches, formMethods, points, total, loadMore, totalIntermediatePointsPrice, }) => {
    const { control } = useFormContext();
    const [openSelectIndex, setOpenSelectIndex] = useState(null);
    const isLoadingIntermediate = useRef(Array.from({ length: 5 }, () => false));
    const lastPageLoadedIntermediate = useRef(Array.from({ length: 5 }, () => 1));
    const loaderRefIntermediate = useRef(Array.from({ length: 5 }, () => null));
    const isAtLastPageIntermediate = useMemo(() => intermediatePointOptions.map((options, index) => points && total > 0 && points.length >= total), [points, total, intermediatePointOptions]);
    useEffect(() => {
        const observerCallbacks = [0, 1, 2, 3, 4].map((index) => {
            return (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting &&
                    !isLoadingIntermediate.current[index] &&
                    !isAtLastPageIntermediate[index]) {
                    isLoadingIntermediate.current[index] = true;
                    lastPageLoadedIntermediate.current[index] += 1;
                    loadMore('intermediate', index);
                }
            };
        });
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };
        const observers = observerCallbacks.map((callback) => {
            return new IntersectionObserver(callback, observerOptions);
        });
        [0, 1, 2, 3, 4].forEach((index) => {
            if (loaderRefIntermediate.current[index]) {
                observers[index].observe(loaderRefIntermediate.current[index]);
            }
        });
        return () => {
            [0, 1, 2, 3, 4].forEach((index) => {
                if (loaderRefIntermediate.current[index]) {
                    observers[index].unobserve(loaderRefIntermediate.current[index]);
                }
            });
        };
    }, [loadMore, isAtLastPageIntermediate]);
    useEffect(() => {
        [0, 1, 2, 3, 4].forEach((index) => {
            isLoadingIntermediate.current[index] = false;
        });
    }, [points]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest('.intermediate-selector'))
                setOpenSelectIndex(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (_jsxs("div", { className: 'w-full flex flex-col gap-4', children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-5 leading-5 mb-2 font-bold", children: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:" }), _jsx(Controller, { name: "description", control: control, render: ({ field }) => (_jsx("textarea", { id: "description", ...field, rows: 5, className: "shadow-sm block w-full sm:text-sm border border-gray-300 p-4 rounded-md resize-none", value: field.value || '', onChange: field.onChange, onBlur: field.onBlur })) })] }), _jsxs("div", { className: 'flex flex-col gap-2', children: [_jsx("label", { className: "block text-5 leading-5 font-bold", children: "\u041F\u0440\u043E\u043C\u0435\u0436\u0443\u0442\u043E\u0447\u043D\u044B\u0435 \u0442\u043E\u0447\u043A\u0438" }), _jsxs("span", { className: "block text-3 leading-3 font-medium text-gray-500", children: ["\u041E\u0431\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C ", totalIntermediatePointsPrice] })] }), _jsx("div", { className: "grid grid-cols-1 gap-4 border p-4 rounded-md", children: [0, 1, 2, 3, 4].map((index) => (_jsxs("div", { className: "relative intermediate-selector flex items-center", children: [_jsx("div", { className: "flex-grow", children: _jsx(Controller, { name: `intermediatePoints.${index}`, control: formMethods.control, defaultValue: "", render: ({ field }) => (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: selectedIntermediatePoints[index]?.address || '', onClick: () => {
                                                setOpenSelectIndex(openSelectIndex === index ? null : index);
                                                handleOpenSelect(index);
                                            }, placeholder: `Промежуточная точка ${index + 1}`, readOnly: true, className: `text-4 leading-4 p-3 w-full border-b border-gray-300` }), openSelectIndex === index && (_jsxs("div", { className: "absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto", children: [_jsx("input", { type: "text", autoFocus: true, value: intermediateSearches[index], onChange: (e) => handleIntermediateSearchChange(e.target.value, index), placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "text-4 leading-4 p-3 w-full border-b" }), intermediatePointOptions[index].map((option, optionIndex) => (_jsx("div", { onClick: () => {
                                                        const point = points?.find((p) => p.uuid === option.value) || null;
                                                        handleIntermediatePointSelect(index, point);
                                                        field.onChange(option.value);
                                                        setOpenSelectIndex(null);
                                                    }, className: "p-3 cursor-pointer hover:bg-gray-100", children: option.label }, `${index}-${optionIndex}-${option.value}`))), !isAtLastPageIntermediate[index] && (_jsx("div", { ref: (el) => {
                                                        loaderRefIntermediate.current[index] = el;
                                                    }, className: "p-2 text-center text-gray-500", children: isLoadingIntermediate.current[index] ? 'Загрузка...' : '' }))] }))] })) }) }), selectedIntermediatePoints[index] && (_jsx("button", { type: "button", className: "ml-3 w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500/20 rounded-md", onClick: () => {
                                handleClearIntermediatePoint(index);
                                setOpenSelectIndex(null);
                            }, children: "X" }))] }, index))) })] }));
};
export default IntermediatePoints;
