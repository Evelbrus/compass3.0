'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect } from 'react';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Pagination from '@shared/components/ui/pagination/Pagination';
import { TextInput } from '@shared/components/ui/inputs';
import { LazyImage } from '@shared/components/ui/images';
import { isDriverOnline } from '@widgets/drivers-nearby/fucntions/isDriverOnline';
import { useFormContext } from 'react-hook-form';
const DriversNearby = ({ drivers, page = 1, perPage = 10, currentTotal, isDriversLoading, searchDriver, handleSearchDriverChange, handlePageChange, handleDriverClick, selectedDriverInfo, serverTime, }) => {
    const { watch, setValue } = useFormContext();
    const formData = watch();
    useEffect(() => {
        if (selectedDriverInfo) {
            setValue('assignedDriverId', selectedDriverInfo.uuid);
        }
    }, [selectedDriverInfo, setValue]);
    const handleDriverRowClick = useCallback((driverId) => {
        if (formData.assignedDriverId === driverId) {
            setValue('assignedDriverId', undefined);
        }
        else {
            setValue('assignedDriverId', driverId);
        }
        handleDriverClick(driverId);
    }, [setValue, handleDriverClick, formData.assignedDriverId]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full h-full flex flex-col gap-4", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-9", children: "\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u043F\u043E\u0431\u043B\u0438\u0437\u043E\u0441\u0442\u0438" }), _jsx(TextInput, { inputClass: "bg-white text-5 font-light leading-5 p-5 rounded-3xl shadow-3xl", placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0424\u0418\u041E", value: searchDriver, onChange: (value) => {
                            if (value === null) {
                                //Обрабатываем случай null, если это необходимо
                                handleSearchDriverChange('');
                            }
                            else if (typeof value === 'string') {
                                handleSearchDriverChange(value);
                            }
                            else {
                                console.warn('TextInput вернул число или bigint. Ожидалась строка для поиска по ФИО.');
                            }
                        } }), _jsx(AnimatedComponent, { className: "w-full h-full bg-transparent rounded-lg", children: isDriversLoading ? null : !drivers || drivers.length === 0 ? (_jsx(NoData, { message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439" })) : (_jsx("div", { className: "w-full overflow-x-auto", children: _jsx("table", { className: "w-full border-collapse rounded-md bg-white border-[#0000001A]", children: _jsx("tbody", { children: drivers.map((driver) => {
                                        const isSelected = selectedDriverInfo?.uuid === driver.uuid;
                                        const serverTimeISO = serverTime
                                            ? serverTime instanceof Date
                                                ? serverTime.toISOString()
                                                : serverTime
                                            : new Date().toISOString();
                                        const isOnline = isDriverOnline(driver.lastActive, serverTimeISO);
                                        return (_jsxs("tr", { className: `relative flex p-4 gap-4 cursor-pointer border-b border-[#0000001A] hover:bg-gray-100 last:border-b-0 w-full ${isSelected ? 'bg-blue-100' : ''}`, onClick: () => handleDriverRowClick(driver.uuid), children: [_jsx("td", { className: "flex justify-center", children: _jsxs("div", { className: "relative w-[50px] h-[50px]", children: [_jsx(LazyImage, { src: driver.profilePhotoPath || '/icons/user-driver.svg', alt: "Driver Avatar", className: "w-[50px] h-[50px] rounded-full object-cover bg-white border" }), _jsx("div", { className: `absolute top-0 left-0 w-4 h-4 rounded-full border-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}` })] }) }), _jsx("td", { className: "flex flex-col items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-start gap-1", children: [_jsx("span", { className: `absolute top-1 left-1/2 text-3 leading-3 font-medium self-start ${isOnline ? 'text-green-500' : 'text-red-500'}`, children: isOnline ? 'В сети' : 'Не в сети' }), _jsx("p", { className: "text-5 leading-5 font-medium", children: driver.fullName }), _jsx("p", { className: "text-4 leading-4 font-light", children: driver.phone })] }) }), isSelected && (_jsx("td", { className: "absolute right-4 top-1/2 -translate-y-1/2", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }))] }, driver.uuid));
                                    }) }) }) })) })] }), currentTotal > perPage && (_jsx(Pagination, { pageNumber: page, pageSize: perPage, totalCount: currentTotal, setPageNumber: (newPage) => handlePageChange(Number(newPage)) }))] }));
};
export default DriversNearby;
