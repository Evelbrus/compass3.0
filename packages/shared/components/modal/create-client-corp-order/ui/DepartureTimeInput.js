import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
const DepartureTimeInput = ({ control }) => {
    const name = 'departureTime';
    const [value, setValue] = useState('');
    const [minDateTime, setMinDateTime] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [formattedTime, setFormattedTime] = useState('');
    useEffect(() => {
        const updateMinDateTime = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            let minutes = now.getMinutes();
            //Находим ближайшую "разрешенную" минуту
            if (minutes % 5 !== 0) {
                minutes = minutes + (5 - (minutes % 5));
            }
            //Если ближайшая разрешенная минута уже в следующем часе, переходим к следующему часу
            if (minutes >= 60) {
                now.setHours(now.getHours() + 1);
                now.setMinutes(0);
                minutes = 0;
                const nextHourYear = now.getFullYear();
                const nextHourMonth = String(now.getMonth() + 1).padStart(2, '0');
                const nextHourDay = String(now.getDate()).padStart(2, '0');
                const nextHour = String(now.getHours()).padStart(2, '0');
                setMinDateTime(`${nextHourYear}-${nextHourMonth}-${nextHourDay}T${nextHour}:${String(minutes).padStart(2, '0')}`);
                return;
            }
            setMinDateTime(`${year}-${month}-${day}T${hours}:${String(minutes).padStart(2, '0')}`);
        };
        updateMinDateTime();
        const intervalId = setInterval(updateMinDateTime, 60000);
        return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            //Форматирование даты
            setFormattedDate(`${date.getDate()} ${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date)} (${new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date)}) ${date.getFullYear()} г.`);
            //Форматирование времени с обновленной логикой определения периода
            const hours = date.getHours();
            const minutes = date.getMinutes();
            let period = '';
            if (hours < 6) {
                period = 'ночь';
            }
            else if (hours < 12) {
                period = 'утро';
            }
            else if (hours < 18) {
                period = 'день';
            }
            else {
                period = 'вечер';
            }
            const formattedTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} (${period})`;
            setFormattedTime(formattedTimeStr);
        }
        else {
            setFormattedDate('');
            setFormattedTime('');
        }
    }, [value]);
    return (_jsxs("div", { children: [_jsx("label", { htmlFor: name, className: "block text-sm font-medium text-gray-700", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0438 \u0432\u0440\u0435\u043C\u044F \u043E\u0442\u044A\u0435\u0437\u0434\u0430" }), _jsx("div", { className: "mt-1", children: _jsx(Controller, { name: name, control: control, rules: { required: 'Выберите дату' }, render: ({ field, fieldState }) => (_jsxs(_Fragment, { children: [_jsx("input", { type: "datetime-local", id: name, className: "w-full p-2 border-2 rounded-md", value: value, onChange: (e) => {
                                    setValue(e.target.value);
                                    field.onChange(e.target.value);
                                }, min: minDateTime }), fieldState.error && (_jsx("p", { className: "mt-2 text-sm text-red-600", id: `${name}-error`, children: fieldState.error.message }))] })) }) }), _jsxs("div", { children: [_jsxs("p", { className: "mt-2 text-sm", children: [_jsx("span", { className: "font-bold", children: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435: " }), formattedDate] }), _jsxs("p", { className: "mt-2 text-sm", children: [_jsx("span", { className: "font-bold", children: "\u0412\u0440\u0435\u043C\u044F: " }), formattedTime] })] })] }));
};
export default DepartureTimeInput;
