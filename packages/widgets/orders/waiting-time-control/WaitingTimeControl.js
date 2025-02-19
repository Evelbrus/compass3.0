import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useCallback } from 'react';
const WaitingTimeControl = ({ waitingTimeMinutes, freeWaitTime, handleWaitingTimeChange, }) => {
    const maxWaitingTime = 60;
    const isDecrementDisabled = useMemo(() => {
        return freeWaitTime !== undefined && waitingTimeMinutes <= (freeWaitTime ?? 0);
    }, [waitingTimeMinutes, freeWaitTime]);
    const isIncrementDisabled = useMemo(() => {
        return maxWaitingTime !== undefined && waitingTimeMinutes >= maxWaitingTime;
    }, [waitingTimeMinutes, maxWaitingTime]);
    const handleDecrement = useCallback(() => {
        if (!isDecrementDisabled) {
            const newTime = Math.max(freeWaitTime ?? 0, waitingTimeMinutes - 5);
            handleWaitingTimeChange(newTime);
        }
    }, [isDecrementDisabled, waitingTimeMinutes, freeWaitTime, handleWaitingTimeChange]);
    const handleIncrement = useCallback(() => {
        if (!isIncrementDisabled) {
            handleWaitingTimeChange(waitingTimeMinutes + 5);
        }
    }, [isIncrementDisabled, waitingTimeMinutes, handleWaitingTimeChange]);
    return (_jsxs("div", { className: `flex flex-col gap-2 items-start`, children: [_jsx("h2", { className: 'text-4 leading-4 font-medium font-helvetica-neue text-gray-500', children: "\u0412\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u0430" }), _jsxs("div", { className: 'w-full flex flex-col', children: [_jsxs("div", { className: "w-full flex justify-between items-center bg-[#2A3037] rounded-md", children: [_jsx("button", { onClick: handleDecrement, disabled: isDecrementDisabled, className: "p-1 m-1 w-[40px] h-[40px] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:text-black hover:bg-blue-200", children: "-" }), _jsxs("div", { className: "px-6 py-2 text-white text-lg font-medium", children: [waitingTimeMinutes, " \u043C\u0438\u043D\u0443\u0442"] }), _jsx("button", { onClick: handleIncrement, disabled: isIncrementDisabled, className: "p-1 m-1 w-[40px] h-[40px] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:text-black hover:bg-blue-200", children: "+" })] }), _jsxs("span", { className: "w-full flex justify-start text-sm text-gray-500", children: ["\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F: ", freeWaitTime !== undefined ? freeWaitTime : '0', " \u043C\u0438\u043D\u0443\u0442"] })] })] }));
};
export default WaitingTimeControl;
