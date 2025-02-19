import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DatePicker from 'react-datepicker';
import { useFormContext, Controller } from 'react-hook-form';
import { format } from 'date-fns';
const CalendarOrder = () => {
    const { control, trigger, formState } = useFormContext();
    return (_jsx("div", { className: "p-4", children: _jsx(Controller, { name: "departureTime", control: control, rules: { required: 'Выберите время отправления' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "block text-5 leading-5 font-bold", children: ["\u041A\u043E\u0433\u0434\u0430?", fieldState.error && (_jsx("span", { className: "text-red-500 text-sm ml-2", children: " (\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0434\u0430\u0442\u0443!)" }))] }), _jsx("span", { children: field.value ? format(new Date(field.value), 'dd MMMM yyyy HH:mm') : 'Не выбрано' })] }), _jsx("div", { className: `rounded-md overflow-hidden ${fieldState.error ? 'border border-red-500' : ''}`, children: _jsx(DatePicker, { selected: field.value ? new Date(field.value) : null, onChange: (date) => {
                                field.onChange(date?.toISOString() || null);
                                trigger('departureTime');
                            }, dateFormat: 'yyyy-MM-dd HH:mm', timeIntervals: 5, timeCaption: "\u0412\u0440\u0435\u043C\u044F", inline: true, showTimeSelect: true, timeFormat: "HH:mm", className: "w-full" //Ensure the datepicker takes up the full width
                         }) }), fieldState.error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: fieldState.error.message }))] })) }) }));
};
export default CalendarOrder;
