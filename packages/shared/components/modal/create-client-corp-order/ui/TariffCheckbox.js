import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { cn } from '@shared/lib';
import { LazyImage } from '@shared/components/ui/images';
import { CheckboxInput } from '@shared/components/ui/inputs';
import { serviceLevelOptions, vehicleTypeOptions, } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import DepartureTimeInput from '@shared/components/modal/create-client-corp-order/ui/DepartureTimeInput';
const TariffCheckbox = ({ control, tariffs, selectedTariffUuid, handleServiceLevelChange, handleVehicleTypeChange, watch, }) => {
    const vehicleTypeValue = watch('vehicleType');
    const serviceLevelValue = watch('serviceLevel');
    const translatedVehicleType = useMemo(() => {
        const selectedOption = vehicleTypeOptions.find((option) => option.value === vehicleTypeValue);
        return selectedOption ? selectedOption.label : 'Транспорт';
    }, [vehicleTypeValue]);
    const selectedTariff = useMemo(() => {
        if (!selectedTariffUuid) {
            return null;
        }
        return tariffs.find((tariff) => tariff.uuid === selectedTariffUuid) || null;
    }, [selectedTariffUuid, tariffs, vehicleTypeValue, serviceLevelValue]);
    const isServiceLevelAvailable = useCallback((level, vehicleType) => {
        return tariffs.some((tariff) => tariff.serviceLevel === level && tariff.vehicleType === vehicleType);
    }, [tariffs]);
    return (_jsxs("div", { className: "flex flex-row flex-wrap justify-between gap-4", children: [_jsxs("div", { className: 'flex-1 flex flex-col gap-4', children: [_jsxs("div", { className: 'flex flex-row flex-wrap gap-4', children: [_jsxs("div", { className: 'flex-1 flex flex-col gap-4', children: [_jsx("label", { className: "block text-gray-700 text-[20px] font-bold", children: "\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442:" }), vehicleTypeOptions
                                        .filter((option) => option.value !== 'None')
                                        .map((typeOption) => (_jsx("div", { className: "mb-2", children: _jsx(Controller, { name: "vehicleType", control: control, render: ({ field }) => (_jsx(CheckboxInput, { label: typeOption.label, checked: field.value === typeOption.value, onChange: () => handleVehicleTypeChange(typeOption.value) })) }) }, typeOption.value)))] }), _jsxs("div", { className: 'flex-1 flex flex-col gap-4', children: [_jsx("label", { className: "block text-gray-700 text-[20px] font-bold", children: "\u041A\u043B\u0430\u0441\u0441:" }), serviceLevelOptions
                                        .filter((option) => option.value !== 'None')
                                        .map((levelOption) => {
                                        const isAvailable = vehicleTypeValue
                                            ? isServiceLevelAvailable(levelOption.value, vehicleTypeValue)
                                            : true;
                                        return (_jsxs("div", { className: "mb-2", children: [_jsx(Controller, { name: "serviceLevel", control: control, render: ({ field }) => (_jsx(CheckboxInput, { label: levelOption.label, checked: field.value === levelOption.value, onChange: () => handleServiceLevelChange(levelOption.value), disabled: !isAvailable, className: !isAvailable ? 'opacity-50 line-through' : '' })) }), !isAvailable && _jsx("p", { className: "text-xs text-gray-500", children: "\u041D\u0435 \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044F" })] }, levelOption.value));
                                    })] })] }), _jsx(DepartureTimeInput, { control: control })] }), _jsx("div", { children: _jsx(TariffCard, { selectedTariff: selectedTariff, selectedVehicleType: vehicleTypeValue, translatedVehicleType: translatedVehicleType, selectedServiceLevel: serviceLevelValue }) })] }));
};
const TariffCard = ({ selectedTariff, selectedVehicleType, translatedVehicleType, selectedServiceLevel, }) => {
    const translatedServiceLevel = useMemo(() => {
        const selectedOption = serviceLevelOptions.find((option) => option.value === selectedServiceLevel);
        return selectedOption ? selectedOption.label : 'Класс';
    }, [selectedServiceLevel]);
    const seatInfo = useMemo(() => {
        switch (selectedVehicleType) {
            case 'Sedan':
                return '4 пас. места';
            case 'Minivan':
                return '6-7 пас. мест';
            case 'Sprinter':
                return 'до 18 пас. мест';
            case 'Bus':
                return '27-30 пас. мест';
            default:
                return '';
        }
    }, [selectedVehicleType]);
    return (_jsxs("div", { className: cn('flex flex-col relative rounded-xl p-4 gap-4 cursor-pointer bg-white transition-all duration-75 border-2'), children: [_jsx(LazyImage, { src: `/images/tariff/${selectedVehicleType?.toLowerCase() || 'default'}.png`, alt: translatedVehicleType || 'Default Vehicle', className: "w-[253px] h-[99px] object-contain pointer-events-none select-none" }), _jsx("div", { className: "w-[253px] flex flex-col gap-2 justify-between", children: selectedTariff ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex flex-col gap-2", children: _jsx("h1", { className: "font-helvetica-neue text-4 leading-5 font-bold truncate", children: _jsx("strong", { children: selectedTariff.name }) }) }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("p", { className: "p-[9px] flex items-center justify-center bg-[#989898] border border-gray-200 rounded-lg font-normal text-22px text-white", children: translatedServiceLevel }), _jsx("p", { className: "p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base", children: translatedVehicleType }), seatInfo && (_jsx("p", { className: "p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base", children: seatInfo })), _jsxs("p", { className: "font-helvetica-neue text-sm leading-5 text-end text-black/50 pl-3 pt-3", children: ["\u041C\u0438\u043D. \u0446\u0435\u043D\u0430: ", _jsxs("strong", { className: "text-black text-5xl", children: [selectedTariff.price, "\u0421"] })] })] })] })) : (_jsx("div", { className: "flex items-center justify-center h-[200px] text-gray-500", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F \u0430\u0432\u0442\u043E \u0438 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u044F" })) })] }));
};
export default TariffCheckbox;
