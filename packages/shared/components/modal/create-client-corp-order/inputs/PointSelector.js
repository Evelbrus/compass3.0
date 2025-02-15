import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
const PointSelector = ({ control, name, label, isOpen, searchValue, onOpenSelect, onSearchValueChange, search, handleSearchChange, filteredPoints, loading, onSelectPoint, selectorRef, observerRef, selectedPoint, arrivalPointPrice, }) => {
    return (_jsx(Controller, { control: control, name: name, rules: name === 'departurePoint'
            ? { required: 'Выберите адрес подачи' }
            : name === 'arrivalPoint'
                ? { required: 'Выберите адрес прибытия' }
                : {}, render: ({ field, fieldState }) => {
            //Значение в форме хранится как строка (UUID выбранной точки).
            //Если передан полный объект в selectedPoint, то используем его,
            //иначе пытаемся найти объект по UUID среди filteredPoints.
            const selectedPointObj = selectedPoint ||
                (field.value ? filteredPoints.find((point) => point.uuid === field.value) || null : null);
            const displayValue = selectedPointObj ? selectedPointObj.address : searchValue;
            return (_jsxs("div", { className: "w-full relative", children: [_jsx("label", { className: "block mb-2", children: label }), _jsx("input", { type: "text", value: displayValue, onClick: onOpenSelect, onChange: (e) => onSearchValueChange(e.target.value), placeholder: "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0432\u0432\u043E\u0434\u0438\u0442\u044C \u0430\u0434\u0440\u0435\u0441...", className: "w-full p-2 border rounded" }), arrivalPointPrice !== undefined && (_jsxs("div", { className: "mt-1 text-sm text-gray-500", children: ["\u0421\u0443\u043C\u043C\u0430 \u0434\u043E \u0442\u043E\u0447\u043A\u0438 \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F: ", arrivalPointPrice ? arrivalPointPrice.toNumber() : 0, "\u0441"] })), isOpen && (_jsxs("div", { className: "absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto", ref: selectorRef, children: [_jsx("input", { type: "text", autoFocus: true, value: search, onChange: handleSearchChange, placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "p-2 w-full border-b" }), filteredPoints.map((point) => (_jsx("div", { className: "p-2 cursor-pointer hover:bg-gray-100", onClick: () => {
                                    //Выполняем дополнительные действия (если нужны)
                                    onSelectPoint(point);
                                    //Обновляем значение поля формы: сохраняем UUID выбранной точки
                                    field.onChange(point.uuid);
                                }, children: point.address }, point.uuid))), _jsx("div", { ref: observerRef, className: "p-2 text-center", children: loading ? 'Загрузка...' : '' })] })), fieldState.error && (_jsx("p", { className: "mt-2 text-sm text-red-600", children: fieldState.error.message }))] }));
        } }));
};
export default PointSelector;
