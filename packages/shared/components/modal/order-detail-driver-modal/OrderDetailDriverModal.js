import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { $orderUuid, closeModal } from '@shared/lib/effector';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LazyImage } from '@shared/components/ui/images';
import { orderStatusOptions } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import OrderDetailDriverModalSkeleton from '@shared/components/modal/order-detail-driver-modal/OrderDetailDriverModalSkeleton';
const OrderDetailDriverModal = () => {
    const orderUuid = useUnit($orderUuid);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchOrderData = async () => {
            if (orderUuid) {
                setLoading(true);
                try {
                    const response = await fetch(`/api/drivers/orders/${orderUuid}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch order details: ${response.status}`);
                    }
                    const data = await response.json();
                    setOrderData(data);
                    setError(null);
                }
                catch (error) {
                    console.error('Error fetching order details:', error);
                    setError(error instanceof Error ? error.message : 'Failed to fetch order details');
                }
                finally {
                    setLoading(false);
                }
            }
        };
        fetchOrderData();
    }, [orderUuid]);
    const closeModalHandler = () => {
        closeModal();
    };
    if (!orderUuid) {
        return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: 'w-[580px] h-full max-h-[800px] flex justify-center', children: [' ', _jsxs("div", { className: "bg-white rounded-3xl p-8", children: [_jsx("p", { children: "No order selected." }), _jsx(IButton, { onClick: closeModalHandler, children: "Close" })] })] }) }));
    }
    if (loading) {
        return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: 'w-[580px] h-full max-h-[800px] flex justify-center', children: [' ', _jsx("div", { className: "bg-white rounded-3xl p-8 w-full max-w-3xl", children: _jsx(OrderDetailDriverModalSkeleton, {}) })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: 'w-[580px] h-full max-h-[800px] flex justify-center', children: [' ', _jsxs("div", { className: "bg-white rounded-3xl p-8 w-full max-w-3xl h-[600px]", children: [_jsxs("p", { children: ["Error: ", error] }), _jsx(IButton, { onClick: closeModalHandler, children: "Close" })] })] }) }));
    }
    const DetailItem = ({ label, value }) => (_jsxs("div", { className: "bg-white rounded-md w-full flex flex-col", children: [_jsxs("span", { className: "block text-gray-500 font-extrabold mr-2 mb-2", children: [label, ":"] }), _jsx("span", { className: "px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full", children: value })] }));
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsx(AnimatedComponent, { duration: 500, className: 'w-[580px] h-full max-h-[800px] flex justify-center', children: _jsxs("div", { className: "bg-white rounded-3xl p-8 relative w-full max-w-3xl overflow-auto", children: [_jsx(IButton, { variant: "close", onClick: closeModalHandler, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) }), _jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Order Details" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435" }), _jsxs("div", { className: "w-full flex flex-col mb-4 gap-4", children: [_jsx(DetailItem, { label: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430", value: orderData.status
                                    ? orderStatusOptions.find((option) => option.value === orderData.status)?.label
                                    : 'Не указан' }), _jsxs("div", { className: "flex w-full gap-4", children: [_jsx(DetailItem, { label: "\u041A\u043B\u0438\u0435\u043D\u0442", value: orderData.createdBy ? orderData.createdBy.fullName : 'Не указан' }), _jsx(DetailItem, { label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D", value: orderData.createdBy ? orderData.createdBy.phone : 'Не указан' })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0435" }), _jsxs("div", { className: "gap-[7px] border border-gray-300 rounded-md flex items-center p-[24px]", children: [_jsx(LazyImage, { src: "/icon_path.svg", alt: "iconPath", className: "w-[10px] h-[72px] mt-[24px]" }), _jsxs("div", { className: "flex flex-col w-full", children: [_jsxs("p", { className: "ml-[9px]", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2", children: "\u0410\u0434\u0440\u0435\u0441 \u043F\u043E\u0434\u0430\u0447\u0438" }), ' ', orderData.departurePoint ? orderData.departurePoint.address : 'Не указано'] }), _jsx("span", { className: "border-b border-gray-300 my-2" }), _jsxs("p", { className: "ml-[9px]", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2", children: "\u0410\u0434\u0440\u0435\u0441 \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F" }), ' ', orderData.arrivalPoint ? orderData.arrivalPoint.address : 'Не указано'] })] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435" }), _jsxs("div", { className: "w-full flex gap-4", children: [_jsxs("div", { className: "mb-1 w-full", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2 mb-2", children: "\u0422\u0430\u0440\u0438\u0444:" }), _jsx("div", { className: "px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full", children: orderData.tariff
                                                    ? `${orderData.tariff.vehicleTypes} - ${orderData.tariff.name}`
                                                    : 'Не указано' })] }), _jsxs("div", { className: "mb-1 w-full", children: [_jsx("span", { className: "block text-gray-500 font-extrabold mr-2 mb-2", children: "\u0412\u0440\u0435\u043C\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F:" }), _jsxs("div", { className: "px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full flex items-center gap-1", children: [_jsx(LazyImage, { src: "/calendar.svg", alt: "calendar-icon", className: "w-[24px] h-[20px]" }), orderData.departureTime
                                                        ? format(new Date(orderData.departureTime), 'dd MMMM yyyy HH:mm', {
                                                            locale: ru,
                                                        })
                                                        : 'Не указано'] })] })] }), _jsxs("div", { className: "w-full flex gap-4", children: [_jsx(DetailItem, { label: "\u041D\u043E\u043C\u0435\u0440 \u0440\u0435\u0439\u0441\u0430", value: orderData.flightNumber || 'Не указано' }), _jsx(DetailItem, { label: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", value: orderData.description || 'Не указано' })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438" }), orderData.orderTariffAdditionalServices &&
                                orderData.orderTariffAdditionalServices.length > 0 ? (_jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "py-2 px-4 font-semibold text-gray-700", children: "\u0423\u0441\u043B\u0443\u0433\u0430" }), _jsx("th", { className: "py-2 px-4 font-semibold text-gray-700", children: "\u0426\u0435\u043D\u0430" })] }) }), _jsx("tbody", { children: orderData.orderTariffAdditionalServices.map((service) => (_jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("td", { className: "py-2 px-4", children: service.tariffOnService?.name || 'N/A' }), _jsxs("td", { className: "py-2 px-4", children: [service.tariffOnService?.price || 0, " \u0441\u043E\u043C"] })] }, service.uuid))) })] })) : (_jsx("p", { children: "\u041D\u0435\u0442 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0443\u0441\u043B\u0443\u0433" })), _jsx("div", { className: "mt-4 flex justify-end", children: _jsxs("h3", { className: "text-gray-500 font-extrabold ", children: ["\u0421\u0443\u043C\u043C\u0430:", ' ', _jsxs("span", { className: "text-xl font-bold mb-2 text-gray-700", children: [orderData.basePrice, "\u0441"] })] }) })] }), _jsx("div", { className: 'w-full flex justify-end', children: _jsx(IButton, { onClick: closeModalHandler, children: "Close" }) })] }) }) }));
};
export default OrderDetailDriverModal;
