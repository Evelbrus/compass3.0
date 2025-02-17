import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
//import { AdditionalService } from '@prisma/client'; // Не нужен, если используем availableServices
import { CheckboxInput } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';
const AdditionalServicesList = ({ label, availableServices, handleServiceSelection, selectedServices, totalAdditionalServicesPrice, }) => {
    const selectedCount = selectedServices.length; //Больше не нужно фильтровать по Boolean
    return (_jsxs("div", { className: "w-full flex flex-col gap-2", children: [_jsx("label", { className: 'flex p-2 border rounded-md bg-[#989898] text-white', children: label }), _jsxs("p", { className: "m-2 text-sm text-gray-500", children: ["\u041E\u0431\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C (", selectedCount, " \u0434\u043E\u043F. \u0443\u0441\u043B\u0443\u0433 ", totalAdditionalServicesPrice, "\u0441)", ' '] }), availableServices.map(({ service, price, isAvailable, tariffOnServiceUuid }) => (_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx(CheckboxInput, { label: service.name, checked: selectedServices.includes(tariffOnServiceUuid || ''), onChange: () => handleServiceSelection(service.uuid, price, isAvailable), disabled: !isAvailable, className: cn(!isAvailable ? 'opacity-50 line-through' : '') }), _jsxs("span", { className: cn('font-bold', !isAvailable ? 'text-gray-400 line-through' : ''), children: [price, "C"] })] }, service.uuid)))] }));
};
export default AdditionalServicesList;
