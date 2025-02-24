import { Action, DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

interface UpdateClientOrderStatusParams {
  orderUuid: string;
  driverStatus?: DriverAcceptanceStatus; // Сделали опциональным
  orderStatus?: OrderStatus; // Сделали опциональным
  notificationUuid: string;
  userId: string;
  createdById: string;
  driverById?: string;
  markNotificationAsRead?: boolean;
  action: Action;
}

export const updateClientOrderStatus = async ({
  orderUuid,
  driverStatus,
  orderStatus,
  notificationUuid,
  userId,
  createdById,
  action,
  markNotificationAsRead,
}: UpdateClientOrderStatusParams) => {
  const body: Partial<UpdateClientOrderStatusParams> = {
    orderUuid,
    notificationUuid,
    userId,
    createdById,
    action,
  };

  if (driverStatus !== undefined) body.driverStatus = driverStatus;
  if (orderStatus !== undefined) body.orderStatus = orderStatus;
  if (markNotificationAsRead !== undefined) body.markNotificationAsRead = markNotificationAsRead;

  const response = await fetch(`/api/client-corp/orders/${orderUuid}/update-client-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Ошибка обновления статуса заказа клиентом: ${response.statusText}`);
  }

  return response.json();
};
