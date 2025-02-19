'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CheckIcon, CloseIcon } from '@shared/components/ui/icon';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
const AdditionalServicesTable = ({ statusTariffs, additionalServices, statusadditionalServices, selectedTariff, }) => {
    if (statusTariffs === 'loading' || statusadditionalServices === 'loading') {
        return (_jsxs("div", { className: "w-full", children: [_jsx(Skeleton, { width: 300, height: 40 }), _jsx(Skeleton, { width: 300, height: 40 }), _jsx(Skeleton, { width: 300, height: 40 })] }));
    }
    if (statusTariffs === 'error') {
        return _jsx("p", { className: "text-red-500", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0442\u0430\u0440\u0438\u0444\u043E\u0432: \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0442\u0430\u0440\u0438\u0444\u043E\u0432" });
    }
    if (statusadditionalServices === 'error') {
        return _jsx("p", { className: "text-red-500", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0443\u0441\u043B\u0443\u0433: \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0443\u0441\u043B\u0443\u0433" });
    }
    return (_jsx(AnimatedComponent, { duration: 500, children: _jsx("div", { className: "w-full", children: additionalServices.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 border", children: "\u0423\u0441\u043B\u0443\u0433\u0430" }), _jsx("th", { className: "px-4 py-2 border", children: "\u0426\u0435\u043D\u0430" }), _jsx("th", { className: "px-4 py-2 border", children: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C" })] }) }), _jsx("tbody", { children: additionalServices.map((service) => {
                                const activeService = selectedTariff?.tariffAdditionalServices?.find((active) => active.service.uuid === service.uuid);
                                return (_jsxs("tr", { className: "text-center", children: [_jsx("td", { className: "px-4 py-2 border text-left", children: service.name }), _jsx("td", { className: "px-4 py-2 border", children: activeService ? `${activeService.price}₽` : 'Недоступно' }), _jsx("td", { className: "px-4 py-2 border flex justify-center", children: activeService && activeService.isAvailable ? (_jsx(CheckIcon, { className: "text-green-500" })) : (_jsx(CloseIcon, { className: "text-red-500" })) })] }, service.uuid));
                            }) })] }) })) : (_jsx("p", { className: "text-center", children: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043E \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0443\u0441\u043B\u0443\u0433\u0430\u0445 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442." })) }) }));
};
export default AdditionalServicesTable;
