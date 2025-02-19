import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LazyImage } from '@shared/components/ui/images';
import { orderStatusOptions } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
const ModalContent = ({ selectedStatus, selectedDeparturePoint, selectedArrivalPoint, selectedIntermediatePoints, selectedTariff, departureTime, flightNumber, description, selectedClientInfo, selectedDriverInfo, freeWaitTime, waitingTimeMinutes, extraWaitingTimeCost, selectedAdditionalServices, price, }) => {
    const orderDetails_client = [
        {
            title: '',
            items: [
                {
                    label: 'Статус заказа',
                    value: orderStatusOptions.find((option) => option.value === selectedStatus)?.label,
                },
            ],
        },
        {
            title: 'Информация о клиенте',
            items: [
                {
                    label: 'Клиент',
                    value: selectedClientInfo ? selectedClientInfo.fullName : 'Не выбран',
                },
                {
                    label: 'Телефон',
                    value: selectedClientInfo ? selectedClientInfo.phone : 'Не указан',
                },
            ],
        },
    ];
    const stops = [
        {
            title: 'Промежуточные точки',
            items: selectedIntermediatePoints.length > 0
                ? selectedIntermediatePoints.map((point, index) => ({
                    label: `Промежуточная точка ${index + 1}`,
                    value: point ? point.address : 'Не выбрано',
                }))
                : [{ label: 'Промежуточные точки', value: 'Не выбраны' }],
        },
    ];
    const orderDetails_order = [
        {
            items: [
                {
                    label: 'Номер рейса',
                    value: flightNumber || 'Не указан',
                },
                {
                    label: 'Описание',
                    value: description || 'Не указан',
                },
            ],
        },
        {
            title: 'Информация о водителе',
            items: [
                {
                    label: 'Водитель',
                    value: selectedDriverInfo ? selectedDriverInfo.fullName : 'Не выбран',
                },
                {
                    label: 'Тип авто',
                    value: selectedDriverInfo?.vehicleDriver?.vehicle?.vehicleType || 'Не указан',
                },
                {
                    label: 'Уровень сервиса',
                    value: selectedDriverInfo?.vehicleDriver?.vehicle?.serviceLevels || 'Не указан',
                },
            ],
        },
        {
            title: 'Время ожидания',
            items: [
                {
                    label: 'Бесплатное время ожидания',
                    value: freeWaitTime ? `${freeWaitTime} минут` : 'Не указано',
                },
                {
                    label: 'Время ожидания',
                    value: waitingTimeMinutes ? `${waitingTimeMinutes} минут` : 'Не указано',
                },
                {
                    label: 'Стоимость ожидания',
                    value: extraWaitingTimeCost ? `${extraWaitingTimeCost} сом` : 'Не указано',
                },
            ],
        },
    ];
    const DetailItem = ({ label, value }) => (_jsxs("div", { className: "bg-white rounded-md w-full flex flex-col", children: [_jsxs("span", { className: "block text-gray-500 font-extrabold mr-2 mb-2", children: [label, ":"] }), _jsx("span", { className: "px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full", children: value })] }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { children: orderDetails_client.map((item, index) => (_jsxs("div", { className: "w-full flex flex-col mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: item.title }), _jsx("div", { className: "flex w-full gap-4", children: item.items.map((subItem, itemIndex) => (_jsx(DetailItem, { label: subItem.label, value: subItem.value }, itemIndex))) })] }, index))) }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0435" }), _jsxs("div", { className: "gap-[7px] border border-gray-300 rounded-md flex items-center p-[24px]", children: [_jsx(LazyImage, { src: "/icon_path.svg", alt: "iconPath", className: "w-[10px] h-[72px] mt-[24px]" }), _jsxs("div", { className: "flex flex-col w-full", children: [_jsxs("p", { className: "ml-[9px]", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2", children: "\u0410\u0434\u0440\u0435\u0441 \u043F\u043E\u0434\u0430\u0447\u0438" }), ' ', selectedDeparturePoint ? selectedDeparturePoint.address : 'Не выбрано'] }), _jsx("span", { className: "border-b border-gray-300 my-2" }), _jsxs("p", { className: "ml-[9px]", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2", children: "\u0410\u0434\u0440\u0435\u0441 \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F" }), ' ', selectedArrivalPoint ? selectedArrivalPoint.address : 'Не выбрано'] })] })] })] }), _jsx("div", { className: "mb-4", children: stops.map((item, index) => (_jsxs("div", { className: "w-full flex flex-col mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: item.title }), _jsx("div", { className: "flex w-full gap-4", children: item.items.map((subItem, itemIndex) => (_jsx(DetailItem, { label: subItem.label, value: subItem.value }, itemIndex))) })] }, index))) }), _jsx("div", { className: "mb-4", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435" }), _jsxs("div", { className: "w-full flex gap-4", children: [_jsxs("div", { className: "mb-1 w-full", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2 mb-2", children: "\u0422\u0430\u0440\u0438\u0444:" }), ' ', _jsx("div", { className: "px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full", children: selectedTariff
                                                ? `${selectedTariff.vehicleType} - ${selectedTariff.serviceLevel}`
                                                : 'Не выбран' })] }), _jsxs("div", { className: "mb-1 w-full", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2 mb-2", children: "\u0412\u0440\u0435\u043C\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F:" }), ' ', _jsxs("div", { className: "px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full flex items-center gap-1", children: [_jsx(LazyImage, { src: "/calendar.svg", alt: "calendar-icon", className: "w-[24px] h-[20px]" }), departureTime
                                                    ? format(new Date(departureTime), 'dd MMMM yyyy HH:mm', { locale: ru })
                                                    : 'Не выбрано'] })] })] }), orderDetails_order.map((item, index) => (_jsxs("div", { className: "w-full flex flex-col mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: item.title }), _jsx("div", { className: "grid grid-cols-2 w-full gap-4", children: item.items.map((item, itemIndex) => (_jsx(DetailItem, { label: item.label, value: item.value }, itemIndex))) })] }, index)))] }) }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438" }), selectedAdditionalServices.length > 0 ? (_jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "py-2 px-4 font-semibold text-gray-700", children: "\u0423\u0441\u043B\u0443\u0433\u0430" }), _jsx("th", { className: "py-2 px-4 font-semibold text-gray-700", children: "\u0426\u0435\u043D\u0430" })] }) }), _jsx("tbody", { children: selectedAdditionalServices.map((service) => (_jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("td", { className: "py-2 px-4", children: service.name }), _jsxs("td", { className: "py-2 px-4", children: [service.price, " \u0441\u043E\u043C"] })] }, service.uuid))) })] })) : (_jsx("p", { children: "\u041D\u0435\u0442 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0443\u0441\u043B\u0443\u0433" })), _jsx("div", { className: "mt-4 flex justify-end", children: _jsxs("h3", { className: "text-gray-500 font-extrabold ", children: ["\u0421\u0443\u043C\u043C\u0430: ", _jsxs("span", { className: "text-xl font-bold mb-2 text-gray-700", children: [price, "\u0441"] })] }) })] })] }));
};
export default ModalContent;
