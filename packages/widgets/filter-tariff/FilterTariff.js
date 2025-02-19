import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
//../../packages/widgets/filter-tariff/FilterTariff.tsx
import React, { useCallback, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { ServiceLevels, VehicleType } from '@prisma/client';
import { CheckboxInput, TextInput } from '@shared/components/ui/inputs';
import { useUnit } from 'effector-react';
import { $selectedVehicleType, $selectedServiceLevel, } from '@shared/lib/effector/orders/stateStore';
//Определяем типы VehicleType и ServiceLevels без "None"
const vehicleTypes = Object.values(VehicleType).filter((vt) => vt !== 'None');
const serviceLevels = Object.values(ServiceLevels).filter((sl) => sl !== 'None');
const FilterTariff = ({ tariffs, selectedTariff, isLoadingTariff, handleVehicleTypeChange, handleServiceLevelChange, handleTariffSelect, }) => {
    const { formState, setValue, control } = useFormContext();
    const [combinedErrorMessage, setCombinedErrorMessage] = React.useState('');
    //Получаем значения из effector store
    const selectedVehicleType = useUnit($selectedVehicleType);
    const selectedServiceLevel = useUnit($selectedServiceLevel);
    useEffect(() => {
        setCombinedErrorMessage((formState.errors.tariff?.vehicleType?.message || '') +
            ' ' +
            (formState.errors?.tariff?.serviceLevel?.message || '') +
            ' ' +
            (formState.errors.tariffUuid?.message || ''));
    }, [
        formState.errors?.tariff?.vehicleType?.message,
        formState.errors?.tariff?.serviceLevel?.message,
        formState.errors.tariffUuid?.message,
    ]);
    const getAvailableServiceLevels = useCallback(() => {
        if (!selectedVehicleType) {
            return serviceLevels;
        }
        return tariffs
            .filter((tariff) => tariff.vehicleType === selectedVehicleType)
            .map((tariff) => tariff.serviceLevel);
    }, [selectedVehicleType, tariffs]);
    const getTariffsForVehicleType = useCallback((vehicleType) => {
        return tariffs.filter((tariff) => tariff.vehicleType === vehicleType);
    }, [tariffs]);
    const handleVehicleTypeChangeWithReset = useCallback((value) => {
        handleVehicleTypeChange(value);
        //Убедитесь, что serviceLevels не пустой
        if (serviceLevels.length > 0) {
            setValue('tariff.serviceLevel', serviceLevels[0]);
        }
        setValue('tariffUuid', '');
    }, [handleVehicleTypeChange, setValue, serviceLevels]);
    const handleServiceLevelChangeWithReset = useCallback((value) => {
        handleServiceLevelChange(value);
        setValue('tariffUuid', '');
    }, [handleServiceLevelChange, setValue]);
    useEffect(() => {
        if (selectedVehicleType && selectedServiceLevel) {
            const foundTariff = tariffs.find((tariff) => tariff.vehicleType === selectedVehicleType &&
                tariff.serviceLevel === selectedServiceLevel);
            if (foundTariff) {
                setValue('tariffUuid', foundTariff.uuid);
                handleTariffSelect(foundTariff.uuid);
            }
            else {
                setValue('tariffUuid', '');
            }
        }
    }, [selectedVehicleType, selectedServiceLevel, tariffs, setValue, handleTariffSelect]);
    return (_jsxs("div", { className: "w-full h-fit bg-white flex flex-col rounded-md", children: [_jsxs("div", { className: "flex flex-row w-full", children: [_jsxs("div", { className: "w-1/3", children: [_jsx("p", { className: "bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light rounded-tl-md", children: "Vehicle Type" }), _jsx(Controller, { name: "tariff.vehicleType", control: control, rules: { required: 'Выберите тип транспортного средства' }, render: ({ field }) => (_jsx(_Fragment, { children: vehicleTypes.map((vt) => (_jsx("div", { className: "px-7 py-4 text-4 leading-4 text-[#989898] font-light", children: _jsx(CheckboxInput, { label: vt, checked: selectedVehicleType === vt, onChange: () => {
                                                const newValue = selectedVehicleType === vt ? null : vt;
                                                field.onChange(newValue);
                                                handleVehicleTypeChangeWithReset(newValue);
                                            }, className: "w-full items-center justify-center" }) }, vt))) })) })] }), _jsxs("div", { className: "w-1/3", children: [_jsx("p", { className: "bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light", children: "Service Level" }), _jsx(Controller, { name: "tariff.serviceLevel", control: control, rules: { required: 'Выберите уровень обслуживания' }, render: ({ field }) => (_jsx(_Fragment, { children: serviceLevels.map((sl) => {
                                        //Используем отфильтрованный serviceLevels
                                        const isServiceLevelAvailable = getAvailableServiceLevels().includes(sl);
                                        return (_jsx("div", { className: `px-7 py-4 text-4 leading-4 text-[#989898] font-light ${isServiceLevelAvailable ? '' : 'opacity-50 pointer-events-none'}`, children: _jsx(CheckboxInput, { label: sl, checked: selectedServiceLevel === sl, onChange: () => {
                                                    const newValue = selectedServiceLevel === sl ? null : sl;
                                                    field.onChange(newValue);
                                                    handleServiceLevelChangeWithReset(newValue);
                                                }, className: "w-full", disabled: !isServiceLevelAvailable }) }, sl));
                                    }) })) })] }), _jsxs("div", { className: "w-1/3", children: [_jsx("p", { className: "bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light rounded-tr-md", children: "Tariff" }), _jsx(Controller, { name: "tariffUuid", control: control, render: ({ field }) => {
                                    const tariffsForVehicleType = selectedVehicleType
                                        ? getTariffsForVehicleType(selectedVehicleType)
                                        : [];
                                    return (_jsxs(_Fragment, { children: [selectedVehicleType && tariffs.length && !isLoadingTariff ? (_jsx("div", { children: serviceLevels.map((serviceLevel) => {
                                                    //Используем отфильтрованный serviceLevels
                                                    const tariff = tariffsForVehicleType.find((t) => t.serviceLevel === serviceLevel);
                                                    return (_jsx("div", { className: "px-7 py-4", children: tariff ? (_jsxs("label", { htmlFor: tariff.uuid, className: "ml-1 w-full flex items-center", children: [_jsx("input", { type: "radio", id: tariff.uuid, name: "tariff", value: tariff.uuid, checked: field.value === tariff.uuid, onChange: () => {
                                                                        field.onChange(tariff.uuid);
                                                                        handleTariffSelect(tariff.uuid);
                                                                    }, className: "hidden" }), _jsx(TextInput, { readOnly: true, value: `${tariff.price}c`, onChange: () => { }, className: "text-6 leading-6 font-extrabold font-helvetica-neue", classNameBg: "bg-transparent", classNameBorderRadius: "border-none rounded-md", classNamePadding: "p-0", classNamePlaceholder: "text-5 leading-5" })] })) : (_jsx("div", { className: "text-gray-500", children: "\u0422\u0430\u0440\u0438\u0444 \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442" })) }, serviceLevel));
                                                }) })) : null, formState.errors.tariffUuid && (_jsx("span", { className: "text-red-500", children: formState.errors.tariffUuid.message }))] }));
                                } })] })] }), combinedErrorMessage && _jsx("div", { className: "text-red-500 p-4", children: combinedErrorMessage }), _jsx("div", { className: "w-full p-4 border-t rounded-b-md bg-white flex", children: _jsxs("div", { className: "w-full flex flex-col gap-4", children: [_jsx("h2", { className: "text-5 leading-5 font-extrabold rounded-tl-md", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0442\u0430\u0440\u0438\u0444\u0435" }), _jsxs("div", { className: "w-full flex flex-row gap-2", children: [_jsx("div", { className: "w-full overflow-x-auto border rounded-md p-4", children: _jsx("table", { className: "w-full table-auto", children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { className: "w-1/2 font-medium px-2 py-1 border-b", children: "\u0426\u0435\u043D\u0430:" }), _jsx("td", { className: "w-1/5 px-2 py-1 border-b", children: _jsxs("span", { children: [selectedTariff?.price ?? '', "c"] }) })] }), _jsxs("tr", { children: [_jsx("td", { className: "font-medium px-2 py-1 border-\u0431", children: "\u0414\u043E\u043F. \u0446\u0435\u043D\u0430 \u0437\u0430 \u0442\u043E\u0447\u043A\u0443:" }), _jsx("td", { className: "px-2 py-1 border-\u0431", children: _jsxs("span", { children: [selectedTariff?.additionalPointPrice ?? '', "c"] }) })] }), _jsxs("tr", { children: [_jsx("td", { className: "font-medium px-2 py-1 border-\u0431", children: "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u0432 \u0411\u0438\u0448\u043A\u0435\u043A\u0435:" }), _jsx("td", { className: "px-2 py-1 border-\u0431", children: _jsxs("span", { children: [selectedTariff?.freeWaitTimeBishkek ?? '', " \u043C\u0438\u043D"] }) })] }), _jsxs("tr", { children: [_jsx("td", { className: "font-medium px-2 py-1 border-\u0431", children: "\u0426\u0435\u043D\u0430 \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u0443 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u043F\u043E\u0441\u043B\u0435 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0433\u043E \u043F\u0435\u0440\u0438\u043E\u0434\u0430 \u0432 \u0411\u0438\u0448\u043A\u0435\u043A\u0435:" }), _jsx("td", { className: "px-2 py-1 border-\u0431", children: _jsxs("span", { children: [selectedTariff?.pricePerMinuteAfterBishkek ?? '', "c"] }) })] }), _jsxs("tr", { children: [_jsx("td", { className: "font-medium px-2 py-1 border-\u0431", children: "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u0432 \u0430\u044D\u0440\u043E\u043F\u043E\u0440\u0442\u0443:" }), _jsx("td", { className: "px-2 py-1 border-\u0431", children: _jsxs("span", { children: [selectedTariff?.freeWaitTimeAirport ?? '', " \u043C\u0438\u043D"] }) })] }), _jsxs("tr", { children: [_jsx("td", { className: "font-medium px-2 py-1 border-\u0431", children: "\u0426\u0435\u043D\u0430 \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u0443 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u043F\u043E\u0441\u043B\u0435 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0433\u043E \u043F\u0435\u0440\u0438\u043E\u0434\u0430 \u0432 \u0430\u044D\u0440\u043E\u043F\u043E\u0440\u0442\u0443:" }), _jsx("td", { className: "px-2 py-1 border-\u0431", children: _jsxs("span", { children: [selectedTariff?.pricePerMinuteAfterAirport ?? '', "c"] }) })] }), _jsxs("tr", { children: [_jsx("td", { className: "font-medium px-2 py-1 border-\u0431", children: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0441\u0435\u0440\u0432\u0438\u0441\u0430:" }), _jsx("td", { className: "px-2 py-1 border-\u0431", children: selectedTariff?.serviceLevel ?? '' })] }), _jsxs("tr", { children: [_jsx("td", { className: "font-medium px-2 py-1 border-\u0431", children: "\u0422\u0438\u043F \u043C\u0430\u0448\u0438\u043D\u044B:" }), _jsx("td", { className: "px-2 py-1 border-\u0431", children: selectedTariff?.vehicleType ?? '' })] })] }) }) }), _jsxs("div", { className: "w-full flex flex-col gap-2", children: [_jsx("h2", { className: "text-5 leading-5 font-extrab\u043E\u043B\u0434 rounded-\u0442\u043B-md", children: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0442\u0430\u0440\u0438\u0444\u0430" }), _jsx("div", { className: "h-full overflow-auto rounded-md bg-white \u043F-2 italic", children: selectedTariff?.description ?? '' })] })] })] }) })] }));
};
export default FilterTariff;
