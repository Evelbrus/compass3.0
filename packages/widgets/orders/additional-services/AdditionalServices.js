import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Controller, useFormContext } from 'react-hook-form';
import { CheckboxInput } from '@shared/components/ui/inputs';
const AdditionalServices = ({ selectedAdditionalServices, handleAdditionalServiceChangeCallback, availableAdditionalServices, additionalServicesLabel, selectedTariff, }) => {
    const { control } = useFormContext();
    return (_jsxs("div", { className: 'w-full flex flex-col gap-4', children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "flightNumber", className: "block text-5 leading-5 mb-2 font-bold", children: "\u041D\u043E\u043C\u0435\u0440 \u0440\u0435\u0439\u0441\u0430:" }), _jsx(Controller, { name: "flightNumber", control: control, render: ({ field, fieldState }) => (_jsx("input", { type: "text", id: "flightNumber", ...field, className: `text-4 leading-4 p-3 w-full border rounded ${fieldState.error ? 'border-red-500' : 'border-gray-300'}`, value: field.value || '', onChange: field.onChange, onBlur: field.onBlur })) })] }), _jsxs("div", { className: 'flex flex-col gap-2', children: [_jsx("label", { className: "block text-5 leading-5 font-bold", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438" }), _jsxs("span", { className: "block text-3 leading-3 font-medium text-gray-500", children: ["\u041E\u0431\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0443\u0441\u043B\u0443\u0433 ", additionalServicesLabel(selectedTariff)] })] }), _jsx("ul", { className: "space-y-2 border p-4 rounded-md", children: availableAdditionalServices.map((s) => {
                    //Типизация `s` убрана
                    const tariffOnServiceUuid = s.uuid;
                    const isChecked = selectedAdditionalServices.some((selected) => selected.uuid === tariffOnServiceUuid);
                    const serviceName = s.service.name;
                    const isDisabled = !s.isAvailable;
                    const price = s.price;
                    const isAvailable = s.isAvailable;
                    return (_jsx("li", { className: "flex items-center", children: _jsx("div", { style: {
                                textDecoration: isDisabled ? 'line-through' : 'none',
                                pointerEvents: isDisabled ? 'none' : 'auto',
                                opacity: isDisabled ? 0.6 : 1,
                            }, children: _jsx(CheckboxInput, { label: `${serviceName} ${isAvailable ? `(${price}с)` : ''}`, checked: isChecked, onChange: (e) => handleAdditionalServiceChangeCallback(e, tariffOnServiceUuid), className: "w-full", disabled: isDisabled }) }) }, tariffOnServiceUuid));
                }) })] }));
};
export default AdditionalServices;
