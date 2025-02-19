import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { TextInput } from '@shared/components/ui/inputs';
//Вспомогательная функция для вычисления разницы между датами (в миллисекундах)
const getDuration = (fromValue, toValue) => {
    const from = new Date(fromValue);
    const to = new Date(toValue);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && to > from) {
        return to.getTime() - from.getTime();
    }
    return 0;
};
//Функция для форматирования миллисекунд в годы, месяцы и дни
const formatDuration = (ms) => {
    const totalDays = ms / (1000 * 60 * 60 * 24);
    const years = Math.floor(totalDays / 365);
    const daysAfterYears = totalDays % 365;
    const months = Math.floor(daysAfterYears / 30);
    const days = Math.floor(daysAfterYears % 30);
    const parts = [];
    if (years)
        parts.push(`${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`);
    if (months)
        parts.push(`${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`);
    if (days)
        parts.push(`${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`);
    return parts.join(', ') || '0 дней';
};
const DriverFormStepFour = ({ mode }) => {
    const { control } = useFormContext();
    //Управление массивом driverExperience через useFieldArray
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'driverProfile.driverExperience',
    });
    //Рассчитываем общее время работы (суммарная длительность всех периодов)
    let totalDurationMs = 0;
    fields.forEach((field) => {
        totalDurationMs += getDuration(new Date(field.from), new Date(field.to));
    });
    const totalDurationText = formatDuration(totalDurationMs);
    return (_jsxs("div", { className: "flex flex-col p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "\u041E\u043F\u044B\u0442 \u0440\u0430\u0431\u043E\u0442\u044B" }), mode === 'edit' && (_jsxs("div", { className: "mb-6 p-4 border border-gray-300 rounded-md bg-gray-50", children: [_jsxs("p", { className: "text-md font-medium", children: ["\u0412\u0441\u0435\u0433\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043E\u0431 \u043E\u043F\u044B\u0442\u0435 \u0440\u0430\u0431\u043E\u0442\u044B: ", _jsx("span", { className: "font-bold", children: fields.length })] }), _jsxs("p", { className: "text-md font-medium", children: ["\u041E\u0431\u0449\u0435\u0435 \u0432\u0440\u0435\u043C\u044F \u0440\u0430\u0431\u043E\u0442\u044B: ", _jsx("span", { className: "font-bold", children: totalDurationText })] })] })), _jsx("div", { className: "space-y-6", children: fields.map((field, index) => (_jsxs("div", { className: "border border-gray-200 rounded-md p-4 space-y-4", children: [_jsx(Controller, { name: `driverProfile.driverExperience.${index}.companyName`, control: control, defaultValue: field.companyName || '', rules: { required: 'Название компании обязательно' }, render: ({ field: { value, onChange }, fieldState }) => (_jsx(TextInput, { label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: value, onChange: (newValue) => onChange(newValue), error: !!fieldState.error, message: fieldState.error?.message || '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438" })) }), _jsx(Controller, { name: `driverProfile.driverExperience.${index}.position`, control: control, defaultValue: field.position || '', rules: { required: 'Должность обязательна' }, render: ({ field: { value, onChange }, fieldState }) => (_jsx(TextInput, { label: "\u0414\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C:", type: "text", value: value, onChange: (newValue) => onChange(newValue), error: !!fieldState.error, message: fieldState.error?.message || '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C" })) }), _jsx(Controller, { name: `driverProfile.driverExperience.${index}.from`, control: control, rules: { required: 'Дата начала работы обязательна' }, render: ({ field: { value, onChange }, fieldState }) => {
                                const dateValue = value instanceof Date
                                    ? value.toISOString().split('T')[0]
                                    : typeof value === 'string'
                                        ? value.split('T')[0]
                                        : '';
                                return (_jsx(TextInput, { label: "\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430 \u0440\u0430\u0431\u043E\u0442\u044B:", type: "date", value: dateValue, onChange: (newValue) => {
                                        onChange(new Date(newValue));
                                    }, error: !!fieldState.error, message: fieldState.error?.message || '', placeholder: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u043D\u0430\u0447\u0430\u043B\u0430 \u0440\u0430\u0431\u043E\u0442\u044B" }));
                            } }), _jsx(Controller, { name: `driverProfile.driverExperience.${index}.to`, control: control, rules: { required: 'Дата окончания работы обязательна' }, render: ({ field: { value, onChange }, fieldState }) => {
                                const dateValue = value instanceof Date
                                    ? value.toISOString().split('T')[0]
                                    : typeof value === 'string'
                                        ? value.split('T')[0]
                                        : '';
                                return (_jsx(TextInput, { label: "\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442\u044B:", type: "date", value: dateValue, onChange: (newValue) => {
                                        onChange(new Date(newValue));
                                    }, error: !!fieldState.error, message: fieldState.error?.message || '', placeholder: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442\u044B" }));
                            } }), _jsx("div", { children: _jsx("button", { type: "button", onClick: () => remove(index), className: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043E\u043F\u044B\u0442" }) })] }, field.id))) }), _jsx("div", { className: "mt-6", children: _jsx("button", { type: "button", onClick: () => append({
                        uuid: uuidv4(),
                        companyName: '',
                        position: '',
                        from: new Date(),
                        to: new Date(),
                        driverProfileId: '',
                    }), className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043E\u043F\u044B\u0442" }) })] }));
};
export default DriverFormStepFour;
