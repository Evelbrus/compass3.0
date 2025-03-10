import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

/**
 * Помечает уведомление как прочитанное с использованием отдельного API-маршрута
 * @param notificationUuid UUID уведомления
 * @returns Результат операции
 */
export const markNotificationAsRead = async (notificationUuid: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/notifications/${notificationUuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });

    return response.ok;
  } catch (error) {
    console.error('Ошибка при отметке уведомления как прочитанное:', error);
    return false;
  }
};

/**
 * Обновляет статус заказа от имени водителя
 */
export async function updateDriverOrderStatus({
  orderUuid,
  driverStatus,
  orderStatus,
  notificationUuid,
  userId,
  clientById,
  driverById,
}: {
  orderUuid: string;
  driverStatus: DriverAcceptanceStatus;
  orderStatus: OrderStatus;
  notificationUuid: string;
  userId: string;
  clientById: string;
  driverById: string | null;
}) {
  try {
    const response = await fetch(`/api/drivers/orders/${orderUuid}/update-driver-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverStatus,
        orderStatus,
        userId,
        clientById,
        driverById,
        notificationUuid,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Не удалось обновить статус заказа');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа водителем:', error);
    throw error;
  }
}

/**
 * Обновляет статус заказа от имени клиента
 */
export async function updateClientOrderStatus({
  orderUuid,
  driverStatus,
  orderStatus,
  notificationUuid,
  userId,
  clientById,
  driverById,
}: {
  orderUuid: string;
  driverStatus: DriverAcceptanceStatus;
  orderStatus: OrderStatus;
  notificationUuid: string;
  userId: string;
  clientById: string;
  driverById: string;
}) {
  try {
    const response = await fetch(`/api/client-corp/orders/${orderUuid}/update-client-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverStatus,
        orderStatus,
        userId,
        clientById,
        driverById,
        notificationUuid,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Не удалось обновить статус заказа');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа клиентом:', error);
    throw error;
  }
}
