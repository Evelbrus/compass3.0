import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
const TariffCreateStep3 = ({ formData, additionalServices, handleAddAdditionalService, handleRemoveAdditionalService, }) => {
    const selectOptions = additionalServices
        .filter((service) => !formData.tariffAdditionalServices.some((selected) => selected.serviceUuid === service.uuid))
        .map((service) => ({
        label: service.name,
        value: service.uuid,
    }));
    console.log('create:', selectOptions);
    const handleSelectChange = (option) => {
        if (!option)
            return;
        if (formData.tariffAdditionalServices.some((service) => service.serviceUuid === option.value)) {
            return;
        }
        const newService = {
            serviceUuid: option.value,
            price: 0,
            isAvailable: true,
        };
        handleAddAdditionalService(newService);
    };
    const handleLocalChange = (index, event) => {
        const { name, value, checked } = event.target;
        const updatedServices = [...formData.tariffAdditionalServices];
        if (name === 'price') {
            updatedServices[index].price = Number(value);
        }
        else if (name === 'isAvailable') {
            updatedServices[index].isAvailable = checked;
        }
        handleAddAdditionalService(updatedServices[index]);
    };
    const handleDelete = (serviceUuid) => {
        handleRemoveAdditionalService(serviceUuid);
    };
    return (_jsxs("div", { className: "p-4 bg-white border-t border-gray-300", children: [_jsx("div", { className: "mb-4 w-1/2", children: _jsx(SelectSingle, { options: selectOptions, value: null, onChange: handleSelectChange, placeholder: "\u041E\u043F\u0446\u0438\u0438" }) }), formData.tariffAdditionalServices.length > 0 && (_jsxs("div", { className: "mt-4 space-y-4", children: [_jsx("h2", { className: "block text-4 font-medium text-gray-500 mb-2", children: "\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0435 \u043E\u043F\u0446\u0438\u0438" }), formData.tariffAdditionalServices.map((service, index) => {
                        const serviceName = additionalServices.find((s) => s.uuid === service.serviceUuid)?.name ||
                            'Unknown Service';
                        return (_jsxs("div", { className: "flex md:flex-row items-start md:items-center gap-4 rounded-md w-1/2", children: [_jsx("div", { className: "w-full md:w-1/3 font-medium", children: serviceName }), _jsxs("div", { className: "w-full flex md:w-1/3 gap-2", children: [_jsx(TextInput, { type: "number", value: service.price, onChange: (e) => handleLocalChange(index, {
                                                target: { name: 'price', value: e },
                                            }), required: true }), _jsx("p", { className: "p-[12px] bg-black text-white w-[40px] flex items-center h-[40px] rounded-lg", children: "C" }), _jsx("button", { className: "p-[12px] bg-white text-red-600 w-[40px] flex items-center justify-center h-[40px] rounded-lg border", onClick: () => handleDelete(service.serviceUuid), children: "-" })] }), _jsx("div", { className: "w-full md:w-1/3 hidden", children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { name: "isAvailable", type: "checkbox", checked: service.isAvailable, onChange: (e) => handleLocalChange(index, e), className: "w-[18px] h-[18px] bg-white rounded-md border border-gray-300 focus:bg-gray-100" }), _jsx("span", { className: "text-[#989898] text-[14px] font-normal", children: "Available" })] }) })] }, `${service.serviceUuid}-${index}`));
                    })] }))] }));
};
export default TariffCreateStep3;
