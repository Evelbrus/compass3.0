// app/src/dto/orders/order-status.dto.ts
import { DriverAcceptanceStatus, Order, OrderStatus, User } from '@prisma/client';

export interface UpdateOrderStatusDTO {
  driverStatus?: DriverAcceptanceStatus;
  orderStatus?: OrderStatus;
  notificationUuid: string;
  userId: string;
  clientById: string;
  driverById?: string;
  markNotificationAsRead?: boolean;
  readOnly?: boolean;
}

export interface UpdateOrderStatusResultDTO {
  updatedOrder: Order;
  updatedDriver: User | null;
  updatedAdminNotifications: Notification[];
  notificationMarkedAsRead?: boolean;
}

