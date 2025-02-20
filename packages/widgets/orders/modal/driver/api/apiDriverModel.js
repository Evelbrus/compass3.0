export const updateOrderStatus = async ({ orderUuid, driverStatus, orderStatus, driverId, notificationUuid, markNotificationAsRead, action, }) => {
    const body = {};
    //Добавляем только те поля, которые переданы
    if (driverStatus !== undefined)
        body.driverStatus = driverStatus;
    if (orderStatus !== undefined)
        body.orderStatus = orderStatus;
    if (driverId !== undefined)
        body.driverId = driverId;
    if (notificationUuid !== undefined)
        body.notificationUuid = notificationUuid;
    if (markNotificationAsRead !== undefined)
        body.markNotificationAsRead = markNotificationAsRead;
    if (action !== undefined)
        body.action = action;
    const response = await fetch(`/api/orders/${orderUuid}/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`Ошибка обновления статуса заказа: ${response.statusText}`);
    }
    return response.json();
};
export const fetchOrderDetails = async (orderUuid) => {
    const response = await fetch(`/api/orders/modal/${orderUuid}`);
    if (!response.ok) {
        throw new Error(`Ошибка получения данных заказа: ${response.statusText}`);
    }
    return response.json();
};
