import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ServiceLevels } from '@prisma/client';
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
const TariffCreateStep2 = ({ formData, setFormData, handleInputChange, }) => {
    const handleFreeWaitTimeChange = (value) => {
        const numberValue = Number(value);
        return numberValue <= 60 ? numberValue : 60;
    };
    return (_jsxs("div", { className: "grid grid-cols-1 gap-4 w-1/2", children: [_jsx("div", { children: _jsx(TextInput, { type: "number", label: "\u0424\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u0430\u044F \u0426\u0435\u043D\u0430 \u0437\u0430 \u041A\u0430\u0436\u0434\u0443\u044E \u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u0442\u043E\u0447\u043A\u0443 \u0432 \u043F\u043E\u0435\u0437\u0434\u043A\u0443", value: formData.additionalPointPrice, onChange: (value) => handleInputChange({
                        target: { id: 'additionalPointPrice', value, type: 'number' },
                    }), required: true }) }), _jsx("div", { children: _jsx(SelectSingle, { label: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u044F", value: formData.serviceLevel
                        ? { value: formData.serviceLevel, label: formData.serviceLevel }
                        : null, onChange: (option) => setFormData({ ...formData, serviceLevel: option?.value }), options: Object.values(ServiceLevels).map((level) => ({
                        value: level,
                        label: level,
                    })) }) }), _jsxs("div", { className: "form-group flex items-center justify-between", children: [_jsx("p", { className: "text-4 font-medium text-gray-500", children: "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u0432\u043D\u0435 \u0410\u044D\u0440\u043E\u043F\u043E\u0440\u0442\u0430" }), _jsx(TextInput, { type: "number", value: formData.freeWaitTimeBishkek, onChange: (value) => handleInputChange({
                            target: {
                                id: 'freeWaitTimeBishkek',
                                value: handleFreeWaitTimeChange(value),
                                type: 'number',
                            },
                        }), required: true })] }), _jsx("p", { className: "text-4 font-medium text-gray-500", children: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430 \u043A\u0430\u0436\u0434\u0443\u044E \u043C\u0438\u043D\u0443\u0442\u044B \u043F\u043E\u0441\u043B\u0435 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u0432\u043D\u0435 \u0410\u044D\u0440\u043E\u043F\u043E\u0440\u0442\u0430 (\u0441\u0443\u043C\u043C\u0430)" }), _jsx("div", { children: _jsx(TextInput, { type: "number", value: formData.pricePerMinuteAfterBishkek, onChange: (value) => handleInputChange({
                        target: { id: 'pricePerMinuteAfterBishkek', value, type: 'number' },
                    }), required: true, placeholder: "\u0446\u0435\u043D\u0430 \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u0443 \u043F\u043E\u0441\u043B\u0435 \u0411\u0438\u0448\u043A\u0435\u043A\u0430" }) }), _jsxs("div", { className: "form-group flex items-center justify-between", children: [_jsx("p", { className: "text-4 font-medium text-gray-500", children: "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u0432 \u0430\u044D\u0440\u043E\u043F\u043E\u0440\u0442\u0443" }), _jsx(TextInput, { type: "number", value: formData.freeWaitTimeAirport, onChange: (value) => handleInputChange({
                            target: {
                                id: 'freeWaitTimeAirport',
                                value: handleFreeWaitTimeChange(value),
                                type: 'number',
                            },
                        }), required: true })] }), _jsx("p", { className: "text-4 font-medium text-gray-500", children: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430 \u043A\u0430\u0436\u0434\u0443\u044E \u043C\u0438\u043D\u0443\u0442\u044B \u043F\u043E\u0441\u043B\u0435 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u0432 \u0410\u044D\u0440\u043E\u043F\u043E\u0440\u0442\u0443 (\u0441\u0443\u043C\u043C\u0430)" }), _jsx("div", { children: _jsx(TextInput, { type: "number", value: formData.pricePerMinuteAfterAirport, onChange: (value) => handleInputChange({
                        target: { id: 'pricePerMinuteAfterAirport', value, type: 'number' },
                    }), required: true, placeholder: "\u0446\u0435\u043D\u0430 \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u0443 \u043F\u043E\u0441\u043B\u0435 \u0430\u044D\u0440\u043E\u043F\u043E\u0440\u0442\u0430" }) })] }));
};
export default TariffCreateStep2;
