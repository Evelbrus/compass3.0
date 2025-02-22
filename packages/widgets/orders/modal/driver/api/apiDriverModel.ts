import { Action, DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

interface UpdateOrderStatusParams {
  orderUuid: string;
  driverStatus?: DriverAcceptanceStatus; // Сделали опциональным
  orderStatus?: OrderStatus; // Сделали опциональным
  notificationUuid: string;
  userId: string; // UUID получателя уведомления (водитель, клиент, администратор)
  createdById: string; // UUID корпоративного клиента, создавшего заказ
  driverById?: string; // UUID водителя, назначенного на заказ
  markNotificationAsRead?: boolean;
  action: Action;
}

export const updateOrderStatus = async ({
                                          orderUuid,
                                          driverStatus,
                                          orderStatus,
                                          userId,
                                          createdById,
                                          notificationUuid,
                                          markNotificationAsRead,
                                          action,
                                          driverById,
                                        }: UpdateOrderStatusParams) => {
  const body: Partial<UpdateOrderStatusParams> = {
    orderUuid,
    notificationUuid,
    userId,
    createdById,
    action,
  };

  // Добавляем только те поля, которые переданы
  if (driverStatus !== undefined) body.driverStatus = driverStatus;
  if (orderStatus !== undefined) body.orderStatus = orderStatus;
  if (driverById !== undefined) body.driverById = driverById;
  if (markNotificationAsRead !== undefined) body.markNotificationAsRead = markNotificationAsRead;

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

export const fetchOrderDetails = async (orderUuid: string) => {
  const response = await fetch(`/api/orders/modal/${orderUuid}`);
  if (!response.ok) {
    throw new Error(`Ошибка получения данных заказа: ${response.statusText}`);
  }
  return response.json();
};