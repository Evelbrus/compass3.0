import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

/**
 * Интерфейс для параметров функций обновления статуса заказа
 */
interface OrderStatusUpdateParams {
  uuid: string; // UUID уведомления
  orderId: string; // ID заказа
  clientId: string | null; // ID клиента
  driverId: string | null; // ID водителя
  driverStatus?: DriverAcceptanceStatus; // Статус принятия водителем (опционально)
  orderStatus?: OrderStatus; // Статус заказа (опционально)
}

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
 * @param params Параметры обновления статуса
 * @returns Результат обновления статуса
 */
export async function updateDriverOrderStatus(params: OrderStatusUpdateParams) {
  try {
    const response = await fetch(`/api/drivers/orders/${params.orderId}/update-driver-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverStatus: params.driverStatus,
        orderStatus: params.orderStatus,
        clientId: params.clientId,
        driverId: params.driverId,
        notificationUuid: params.uuid,
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
 * @param params Параметры обновления статуса
 * @returns Результат обновления статуса
 */
export async function updateClientOrderStatus(params: OrderStatusUpdateParams) {
  try {
    const response = await fetch(`/api/client-corp/orders/${params.orderId}/update-client-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverStatus: params.driverStatus,
        orderStatus: params.orderStatus,
        clientId: params.clientId,
        driverId: params.driverId,
        notificationUuid: params.uuid,
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
