'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const OrderDetails = ({ orderId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch order: ${response.statusText}`);
                }
                const data = await response.json();
                setOrder(data);
            }
            catch (error) {
                setError(error.message || 'Failed to fetch order details.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);
    if (loading) {
        return _jsx("div", { children: "Loading order details..." });
    }
    if (error) {
        return _jsxs("div", { children: ["Error: ", error] });
    }
    if (!order) {
        return _jsx("div", { children: "Order not found." });
    }
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsx("h2", { children: "Order Details" }), _jsxs("p", { children: [_jsx("strong", { children: "UUID:" }), " ", order.uuid] }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", order.status] }), _jsxs("p", { children: [_jsx("strong", { children: "Created By:" }), " ", order.createdBy.fullName, " (", order.createdBy.email, ")"] }), order.assignedDriver && (_jsxs("p", { children: [_jsx("strong", { children: "Assigned Driver:" }), " ", order.assignedDriver.fullName, " (", order.assignedDriver.email, ")"] })), _jsxs("p", { children: [_jsx("strong", { children: "Tariff:" }), " ", order.tariff.name, " (", order.tariff.vehicleTypes, ")"] }), _jsxs("p", { children: [_jsx("strong", { children: "Departure Time:" }), " ", new Date(order.departureTime).toLocaleString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Departure Point:" }), " ", order.departurePoint.address, " (", order.departurePoint.basePrice, ")"] }), _jsxs("p", { children: [_jsx("strong", { children: "Arrival Point:" }), " ", order.arrivalPoint.address, " (", order.arrivalPoint.basePrice, ")"] }), order.intermediatePoints && order.intermediatePoints.length > 0 && (_jsxs("div", { children: [_jsx("strong", { children: "Intermediate Points:" }), _jsx("ul", { children: order.intermediatePoints.map((point, index) => (_jsxs("li", { children: [" ", point] }, index))) })] })), _jsxs("p", { children: [_jsx("strong", { children: "Base Price:" }), " ", order.basePrice] }), order.orderTariffAdditionalServices && order.orderTariffAdditionalServices.length > 0 && (_jsxs("div", { children: [_jsx("strong", { children: "Additional Services:" }), _jsx("ul", { children: order.orderTariffAdditionalServices.map((service) => (_jsxs("li", { children: [service.tariffOnService.name, " (", service.tariffOnService.price, ")"] }, service.uuid))) })] }))] }));
};
export default OrderDetails;
