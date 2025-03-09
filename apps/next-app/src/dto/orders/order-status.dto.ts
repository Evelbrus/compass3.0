// app/src/dto/orders/order-status.dto.ts
import { Action, DriverAcceptanceStatus, Order, OrderStatus, User } from '@prisma/client';

export interface UpdateOrderStatusDTO {
  driverStatus?: DriverAcceptanceStatus;
  orderStatus?: OrderStatus;
  notificationUuid: string;
  userId: string;
  createdById: string;
  driverById?: string;
  markNotificationAsRead?: boolean;
  action: Action;
  originalAction?: Action;
  readOnly?: boolean;
}

export interface UpdateOrderStatusResultDTO {
  updatedOrder: Order;
  updatedDriver: User | null;
  updatedAdminNotifications: any[];
  previousDriverId?: string | null;
  notificationMarkedAsRead?: boolean;
}
