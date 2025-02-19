'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LazyImage } from '@shared/components/ui/images';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import { vehicleSeats, vehicleTypeOptions, } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { cn } from '@shared/lib';
import { openModal } from '@shared/lib/effector';
const TariffTypes = ({ tariff, mode, onSelectTariff, selectedTariff, clientCorp, }) => {
    const router = useRouter();
    const { uuid, name, vehicleType, price, tariffAdditionalServices = [] } = tariff;
    const vehicleTypeOption = vehicleTypeOptions.find((option) => option.value === vehicleType);
    const translatedVehicleType = vehicleTypeOption ? vehicleTypeOption.label : vehicleType;
    const seats = vehicleSeats[vehicleType] || '';
    const handleEdit = () => {
        router.push(`/tariff-management/edit/${uuid}`);
    };
    const handleCreate = () => {
        openModal('createClientCorpOrder');
    };
    const isActive = selectedTariff?.uuid === tariff.uuid;
    return (_jsxs("div", { className: cn('min-w-[284px] flex flex-col relative rounded-xl p-4 gap-4 cursor-pointer bg-white transition-all duration-75', {
            'shadow-lg border border-gray-300': isActive,
        }), onClick: () => onSelectTariff(tariff), children: [_jsx(LazyImage, { src: `/images/tariff/${vehicleType?.toLowerCase() || 'default'}.png`, alt: translatedVehicleType || 'Default Vehicle', className: "w-[253px] h-[99px] object-contain pointer-events-none select-none" }), _jsxs("div", { className: "w-full flex flex-col gap-2 justify-between", children: [_jsx("div", { className: "flex flex-col gap-2", children: _jsx("h1", { className: "font-helvetica-neue text-4 leading-5 font-bold truncate", children: _jsx("strong", { children: name }) }) }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("h4", { className: "font-helvetica-neue text-sm leading-5 text-black/50", children: "\u041F\u0430\u0441\u0441\u0430\u0436\u0438\u0440\u0441\u043A\u0438\u0435 \u043C\u0435\u0441\u0442\u0430:" }), _jsx("p", { className: "p-[9px] flex items-center justify-center bg-[#989898] border border-gray-200 rounded-lg font-normal text-[22px] text-white", children: seats }), _jsx("p", { className: "p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base", children: translatedVehicleType }), _jsx(IButton, { onClick: clientCorp ? handleCreate : handleEdit, className: "w-full h-[40px] border-none bg-[color:var(--button-secondary)] rounded-lg\n            text-white font-semibold transition duration-300 ease-in-out\n            hover:bg-[color:var(--button-secondary-hover)]", textClassName: "text-end text-4 leading-4 font-normal justify-center", children: clientCorp ? 'Выбрать тариф' : mode === 'createOrder' ? 'Выбрать' : 'Редактировать' }), _jsxs("p", { className: "font-helvetica-neue text-sm leading-5 text-end text-black/50 pl-3 pt-3", children: ["\u0426\u0435\u043D\u0430: ", _jsxs("strong", { className: "text-black text-5xl", children: [price, "\u20BD"] })] })] })] })] }));
};
export default TariffTypes;
