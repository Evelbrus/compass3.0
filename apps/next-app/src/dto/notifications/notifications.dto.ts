// dto/notifications/notifications.dto.ts

// DTO для отправки уведомления через WebSocket Также она аналогична схеме в БД Уведомлений Notification
export interface NotificationWebSocketDTO {
  uuid: string; //
  userId: string | null; // создатель уведомления, может быть кто угодно.
  clientById: string | null; // Клиент которому назначен заказ
  driverById: string | null; // Водитель которому назначен заказ
  orderId: string | null; // uuid заказа
  title: string | null;
  message: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
