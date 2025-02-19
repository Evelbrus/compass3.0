import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext } from 'react-hook-form';
const WaitingTime = ({ selectedTariff, handleWaitingTimeIncrement, handleWaitingTimeDecrement, minWaitTime, points, }) => {
    const { watch } = useFormContext();
    const waitingTimeMinutes = watch().waitingTimeMinutes;
    const departurePointUuid = watch().departurePoint;
    const departurePoint = points?.find((point) => point.uuid === departurePointUuid);
    const isAirport = departurePoint?.airport;
    const freeWaitTime = isAirport
        ? selectedTariff?.freeWaitTimeAirport
        : selectedTariff?.freeWaitTimeBishkek;
    const pricePerMinute = isAirport
        ? selectedTariff?.pricePerMinuteAfterAirport
        : selectedTariff?.pricePerMinuteAfterBishkek;
    if (!selectedTariff) {
        return _jsx("div", { children: "Loading..." });
    }
    return (_jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsxs("div", { className: 'w-full flex flex-col', children: [_jsxs("label", { className: "text-lg text-black font-medium", children: ["\u0412\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F ", isAirport ? '(аэропорт)' : ''] }), _jsxs("div", { className: 'flex justify-center items-center bg-gray-500 rounded-md p-2', children: [_jsx("button", { onClick: handleWaitingTimeDecrement, disabled: waitingTimeMinutes === minWaitTime, className: "px-2 py-1 rounded-md text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: "-" }), _jsxs("p", { className: "mx-4 text-lg text-white font-medium", children: [waitingTimeMinutes, " minutes"] }), _jsx("button", { onClick: handleWaitingTimeIncrement, disabled: waitingTimeMinutes === 60, className: "px-2 py-1 rounded-md text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: "+" })] })] }), _jsxs("div", { className: 'w-full flex flex-col items-center mt-2', children: [_jsxs("label", { className: "text-sm text-gray-700 font-medium", children: ["\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F: ", freeWaitTime, " \u043C\u0438\u043D\u0443\u0442"] }), _jsxs("label", { className: "text-sm text-gray-700 font-medium", children: ["\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430 \u043A\u0430\u0436\u0434\u0443\u044E \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u043C\u0438\u043D\u0443\u0442\u0443: ", pricePerMinute, " \u0441\u043E\u043C"] })] })] }));
};
export default WaitingTime;
