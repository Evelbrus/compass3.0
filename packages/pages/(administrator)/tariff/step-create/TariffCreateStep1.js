import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { VehicleType } from '@prisma/client';
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
const TariffCreateStep1 = ({ formData, setFormData, handleInputChange, }) => {
    return (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { className: "mb-4 col-span-1", children: _jsx(TextInput, { type: "text", value: formData.name, label: "Name:", onChange: (value) => handleInputChange({
                        target: { id: 'name', value, type: 'text' },
                    }), placeholder: "tariff name", required: true }) }), _jsx("div", { children: _jsx(SelectSingle, { label: "Vehicle Type:", value: formData.vehicleType
                        ? { value: formData.vehicleType, label: formData.vehicleType }
                        : null, onChange: (option) => setFormData({ ...formData, vehicleType: option?.value }), options: Object.values(VehicleType).map((type) => ({
                        value: type,
                        label: type,
                    })) }) }), _jsx("div", { children: _jsx(TextInput, { type: "text", label: "Description:", value: formData.description || '', maxLength: 500, onChange: (value) => handleInputChange({
                        target: { id: 'description', value, type: 'text' },
                    }), placeholder: "description" }) }), _jsx("div", { children: _jsx(TextInput, { type: "number", label: "Price:", value: formData.price, onChange: (value) => handleInputChange({
                        target: { id: 'price', value, type: 'number' },
                    }), required: true }) })] }));
};
export default TariffCreateStep1;
