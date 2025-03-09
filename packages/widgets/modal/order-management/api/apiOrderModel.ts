// Файл: apiOrderModel.ts

import { Action, DriverAcceptanceStatus, OrderStatus, UserRole } from '@prisma/client';

interface UpdateOrderStatusParams {
  orderUuid: string;
  driverStatus?: DriverAcceptanceStatus;
  orderStatus?: OrderStatus;
  notificationUuid: string;
  userId: string;
  createdById: string;
  driverById?: string;
  markNotificationAsRead?: boolean;
  action: Action;
  readOnly?: boolean;
  originalAction?: Action;
}

type UpdateOrderResult = {
  status: string;
  updatedOrder: any;
  updatedDriver?: any;
  updatedAdminNotifications?: any[];
  previousDriverId?: string | null;
  notificationMarkedAsRead?: boolean;
};

// Получаем URL для разных ролей пользователей
const getApiUrlByRole = (role: UserRole, orderUuid: string): string => {
  switch (role) {
    case UserRole.Admin:
    case UserRole.Operator:
      return `/api/admin/orders/${orderUuid}/update-admin-status`;
    case UserRole.ClientCorp:
      return `/api/client-corp/orders/${orderUuid}/update-client-status`;
    case UserRole.Driver:
      return `/api/drivers/orders/${orderUuid}/update-driver-status`;
    default:
      throw new Error(`Неподдерживаемая роль пользователя: ${role}`);
  }
};

// Получаем текст ошибки для разных ролей
const getErrorMessageByRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.Admin:
    case UserRole.Operator:
      return 'Ошибка обновления статуса заказа администратором';
    case UserRole.ClientCorp:
      return 'Ошибка обновления статуса заказа клиентом';
    case UserRole.Driver:
      return 'Ошибка обновления статуса заказа водителем';
    default:
      return 'Ошибка обновления статуса заказа';
  }
};

/**
 * Универсальная функция для обновления статуса заказа
 * @param params Параметры для обновления статуса
 * @param role Роль пользователя, выполняющего действие
 */
export const updateOrderStatus = async (
  params: UpdateOrderStatusParams,
  role: UserRole,
): Promise<UpdateOrderResult> => {
  const {
    orderUuid,
    driverStatus,
    orderStatus,
    notificationUuid,
    userId,
    createdById,
    action,
    markNotificationAsRead,
    readOnly,
    driverById,
    originalAction,
  } = params;

  const body: Partial<UpdateOrderStatusParams> = {
    orderUuid,
    notificationUuid,
    userId,
    createdById,
    action,
  };

  if (driverStatus !== undefined) body.driverStatus = driverStatus;
  if (orderStatus !== undefined) body.orderStatus = orderStatus;
  if (markNotificationAsRead !== undefined) body.markNotificationAsRead = markNotificationAsRead;
  if (readOnly !== undefined) body.readOnly = readOnly;
  if (driverById !== undefined) body.driverById = driverById;
  if (originalAction !== undefined) body.originalAction = originalAction;

  const url = getApiUrlByRole(role, orderUuid);
  const errorMessage = getErrorMessageByRole(role);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Функция для получения информации о уведомлении
 * @param notificationUuid UUID уведомления
 */
export const getNotificationDetails = async (
  notificationUuid: string,
): Promise<{ action: Action } | null> => {
  try {
    const response = await fetch(`/api/notifications/${notificationUuid}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Ошибка получения данных уведомления:', error);
    return null;
  }
};

/**
 * Функция для отметки уведомления как прочитанного
 * @param params Базовые параметры уведомления
 * @param role Роль пользователя, выполняющего действие
 */
export const markNotificationAsRead = async (
  params: Omit<UpdateOrderStatusParams, 'markNotificationAsRead' | 'readOnly' | 'originalAction'>,
  role: UserRole,
): Promise<UpdateOrderResult> => {
  // Попытка получить оригинальный action из уведомления
  let originalAction: Action | undefined;
  try {
    const notification = await getNotificationDetails(params.notificationUuid);
    if (notification) {
      originalAction = notification.action;
    }
  } catch (error) {
    console.warn('Не удалось получить оригинальный тип действия уведомления:', error);
  }

  return updateOrderStatus(
    {
      ...params,
      markNotificationAsRead: true,
      readOnly: true,
      originalAction: originalAction || params.action, // Используем оригинальный action, если доступен
    },
    role,
  );
};

// Для обратной совместимости экспортируем отдельные функции с предопределенными ролями
export const updateAdminOrderStatus = (params: UpdateOrderStatusParams) =>
  updateOrderStatus(params, UserRole.Admin);

export const updateClientOrderStatus = (params: UpdateOrderStatusParams) =>
  updateOrderStatus(params, UserRole.ClientCorp);

export const updateDriverOrderStatus = (params: UpdateOrderStatusParams) =>
  updateOrderStatus(params, UserRole.Driver);

// Для обратной совместимости экспортируем функции для отметки о прочтении
export const markAdminNotificationAsRead = (
  params: Omit<UpdateOrderStatusParams, 'markNotificationAsRead' | 'readOnly' | 'originalAction'>,
) => markNotificationAsRead(params, UserRole.Admin);

export const markClientNotificationAsRead = (
  params: Omit<UpdateOrderStatusParams, 'markNotificationAsRead' | 'readOnly' | 'originalAction'>,
) => markNotificationAsRead(params, UserRole.ClientCorp);

export const markDriverNotificationAsRead = (
  params: Omit<UpdateOrderStatusParams, 'markNotificationAsRead' | 'readOnly' | 'originalAction'>,
) => markNotificationAsRead(params, UserRole.Driver);
