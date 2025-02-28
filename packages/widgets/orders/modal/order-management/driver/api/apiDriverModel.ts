import { Action, DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

interface UpdateDriverOrderStatusParams {
  orderUuid: string;
  driverStatus?: DriverAcceptanceStatus; // Сделали опциональным
  orderStatus?: OrderStatus; // Сделали опциональным
  notificationUuid: string;
  userId: string; // UUID получателя уведомления
  createdById: string; // UUID корпоративного клиента
  driverById?: string; // UUID водителя
  markNotificationAsRead?: boolean;
  action: Action;
}

export const updateDriverOrderStatus = async ({
  orderUuid,
  driverStatus,
  orderStatus,
  notificationUuid,
  userId,
  createdById,
  action,
  markNotificationAsRead,
}: UpdateDriverOrderStatusParams) => {
  const body: Partial<UpdateDriverOrderStatusParams> = {
    orderUuid,
    notificationUuid,
    userId,
    createdById,
    action,
  };

  if (driverStatus !== undefined) body.driverStatus = driverStatus;
  if (orderStatus !== undefined) body.orderStatus = orderStatus;
  if (markNotificationAsRead !== undefined) body.markNotificationAsRead = markNotificationAsRead;

  const response = await fetch(`/api/drivers/orders/${orderUuid}/update-driver-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Ошибка обновления статуса заказа водителем: ${response.statusText}`);
  }

  return response.json();
};
