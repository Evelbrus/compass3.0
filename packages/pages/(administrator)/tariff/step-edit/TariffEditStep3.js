import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { CheckboxInput, SelectSingle, TextInput } from '@shared/components/ui/inputs';
const TariffEditStep3 = ({ data, additionalServices }) => {
    const { control, watch, setValue } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        name: 'tariffAdditionalServices',
        control,
    });
    const [availableServices, setAvailableServices] = useState([]);
    const [removedServices, setRemovedServices] = useState([]);
    useEffect(() => {
        const selectOptions = additionalServices
            .filter((service) => !data.tariffAdditionalServices.some((selected) => selected.service.uuid === service.uuid))
            .map((service) => ({
            label: service.name,
            value: service.uuid,
        }));
        setAvailableServices(selectOptions);
    }, [additionalServices, data.tariffAdditionalServices]);
    const handleSelectChange = (option) => {
        if (!option)
            return;
        const isAlreadyAdded = fields.some((field) => field.id === option.value);
        if (isAlreadyAdded)
            return;
        const isRemoved = removedServices.some((service) => service.value === option.value);
        if (isRemoved) {
            setRemovedServices((prev) => prev.filter((service) => service.value !== option.value));
        }
        append({
            serviceUuid: option.value,
            price: 0,
            isAvailable: true,
        });
        setAvailableServices((prevOptions) => prevOptions.filter((opt) => opt.value !== option.value));
    };
    const handleRemoveService = (index, serviceUuid) => {
        remove(index);
        const removedService = additionalServices.find((service) => service.uuid === serviceUuid);
        if (removedService) {
            setRemovedServices((prev) => [
                ...prev,
                {
                    label: removedService.name,
                    value: removedService.uuid,
                },
            ]);
        }
    };
    return (_jsxs("div", { className: "p-4 bg-white border-t border-gray-300", children: [_jsx("div", { className: "mb-4 w-1/2", children: _jsx(SelectSingle, { options: [...availableServices, ...removedServices], value: null, onChange: handleSelectChange, placeholder: "\u041E\u043F\u0446\u0438\u0438" }) }), _jsx("h2", { className: "block text-4 font-medium text-gray-500 mb-2", children: "\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0435 \u043E\u043F\u0446\u0438\u0438" }), fields.map((service, index) => {
                const serviceUuid = watch(`tariffAdditionalServices.${index}.serviceUuid`);
                const selectedService = additionalServices.find((item) => item.uuid === serviceUuid);
                const serviceName = selectedService ? selectedService.name : '';
                return (_jsxs("div", { className: "flex md:flex-row items-start md:items-center gap-4 rounded-md w-1/2 mb-2", children: [_jsx("p", { className: "w-full md:w-1/3 font-medium", children: serviceName }), _jsxs("div", { className: "w-full flex md:w-1/3 gap-2", children: [_jsx(Controller, { name: `tariffAdditionalServices.${index}.price`, control: control, render: ({ field }) => (_jsx(TextInput, { ...field, placeholder: "Enter price", type: "number" })) }), _jsx("p", { className: "p-[12px] bg-black text-white w-[40px] flex items-center h-[40px] rounded-lg", children: "C" }), _jsx("button", { type: "button", className: "p-[12px] bg-white text-red-600 w-[40px] flex items-center justify-center h-[40px] rounded-lg border", onClick: () => handleRemoveService(index, serviceUuid), children: "-" })] }), _jsx("div", { className: "mt-[30px] hidden", children: _jsx(Controller, { name: `tariffAdditionalServices.${index}.isAvailable`, control: control, render: ({ field }) => (_jsx(CheckboxInput, { ...field, label: "Available", checked: field.value })) }) })] }, service.id));
            })] }));
};
export default TariffEditStep3;
