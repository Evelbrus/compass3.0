import React from 'react';
import {
  UserRole,
  Action,
  DriverAcceptanceStatus,
  type Notification as PrismaNotification,
} from '@prisma/client';
import { canCancelOrder } from '@widgets/modal/order-management/utils/orderUtils';
import type { OrderDetail } from '@widgets/modal/order-management/types/order.types';

interface RenderOrderActionsProps {
  userRole: UserRole;
  notification: PrismaNotification;
  currentStage: DriverAcceptanceStatus;
  orderData: OrderDetail | null;
  isLoading: boolean;
  onMarkAsRead: () => void;
  onCancelOrder: () => void;
  onDriverAction?: (
    driverStatus: DriverAcceptanceStatus,
    action: Action,
    successMessage: string,
    errorMessage: string,
  ) => void;
  onEditOrder?: () => void; // Добавляем обработчик для редактирования заказа
  onClose: () => void;
}

export const renderOrderActions = ({
  userRole,
  notification,
  currentStage,
  orderData,
  isLoading,
  onMarkAsRead,
  onCancelOrder,
  onDriverAction,
  onEditOrder,
  onClose,
}: RenderOrderActionsProps) => {
  // Для администратора
  if (userRole === UserRole.Admin) {
    switch (notification.action) {
      case Action.noted:
        return notification.read ? (
          <>
            <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition">
              Уведомление прочитано
            </button>
            {onEditOrder && (
              <button
                onClick={onEditOrder}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                Редактировать заказ
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={onMarkAsRead}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Ознакомился
            </button>
            {onEditOrder && (
              <button
                onClick={onEditOrder}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                Редактировать заказ
              </button>
            )}
          </>
        );
      case Action.inProgress:
      case Action.warning:
        return (
          <>
            {onEditOrder && (
              <button
                onClick={onEditOrder}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                Редактировать заказ
              </button>
            )}
            {orderData?.assignedDriver?.phone && (
              <button
                className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition"
                onClick={() => window.open(`tel:${orderData?.assignedDriver?.phone}`)}
              >
                Связаться с водителем
              </button>
            )}
          </>
        );
      case Action.success:
        return (
          <>
            <button
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
              onClick={onClose}
            >
              Поездка завершена
            </button>
            {onEditOrder && (
              <button
                onClick={onEditOrder}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                Редактировать заказ
              </button>
            )}
          </>
        );
      case Action.cancelled:
        return (
          <>
            <button
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
              onClick={onClose}
            >
              Заказ отменен
            </button>
            {onEditOrder && (
              <button
                onClick={onEditOrder}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                Редактировать заказ
              </button>
            )}
          </>
        );
      default:
        return onEditOrder ? (
          <button
            onClick={onEditOrder}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            Редактировать заказ
          </button>
        ) : null;
    }
  }

  // Для клиента корпоративного
  if (userRole === UserRole.ClientCorp) {
    switch (notification.action) {
      case Action.noted:
        return notification.read ? (
          <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition">
            Уведомление прочитано
          </button>
        ) : (
          <button
            onClick={onMarkAsRead}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Ознакомился
          </button>
        );
      case Action.inProgress:
      case Action.warning:
        return (
          <>
            <button
              className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition"
              onClick={() =>
                orderData?.assignedDriver?.phone &&
                window.open(`tel:${orderData?.assignedDriver?.phone}`)
              }
            >
              Связаться с водителем
            </button>
            <button
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              onClick={onCancelOrder}
              disabled={isLoading || !canCancelOrder(currentStage, UserRole.ClientCorp)}
            >
              {isLoading ? 'Отмена...' : 'Отменить заказ'}
            </button>
          </>
        );
      case Action.success:
        return (
          <button
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            onClick={onClose}
          >
            Поездка завершена
          </button>
        );
      case Action.cancelled:
        return (
          <button
            className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
            onClick={onClose}
          >
            Заказ отменен
          </button>
        );
      default:
        return null;
    }
  }

  // Для водителя
  if (userRole === UserRole.Driver && onDriverAction) {
    switch (notification.action) {
      case Action.inProgress:
        switch (currentStage) {
          case DriverAcceptanceStatus.PENDING:
          case DriverAcceptanceStatus.TAKEN:
            return (
              <>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.ACCEPTED,
                      Action.inProgress,
                      `Заказ #${notification.orderId?.slice(0, 5)} принят`,
                      'Не удалось принять заказ',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Принимается...' : 'Принять заказ'}
                </button>
                <button
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.PENDING,
                      Action.cancelled,
                      `Заказ #${notification.orderId?.slice(0, 5)} отклонён`,
                      'Не удалось отклонить заказ',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Отклоняется...' : 'Отклонить'}
                </button>
              </>
            );
          case DriverAcceptanceStatus.ACCEPTED:
            return (
              <>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.ON_THE_WAY,
                      Action.inProgress,
                      'Вы поехали к клиенту',
                      'Не удалось обновить статус',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Обновляется...' : 'Поехать к клиенту'}
                </button>
                <button
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.PENDING,
                      Action.cancelled,
                      `Заказ #${notification.orderId?.slice(0, 5)} отменён водителем`,
                      'Не удалось отменить заказ',
                    )
                  }
                  disabled={isLoading || !canCancelOrder(currentStage, UserRole.Driver)}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
              </>
            );
          case DriverAcceptanceStatus.ON_THE_WAY:
            return (
              <>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.ARRIVED,
                      Action.inProgress,
                      'Вы прибыли к клиенту',
                      'Не удалось обновить статус',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Обновляется...' : 'Прибыл к клиенту'}
                </button>
                <button
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.PENDING,
                      Action.cancelled,
                      `Заказ #${notification.orderId?.slice(0, 5)} отменён водителем`,
                      'Не удалось отменить заказ',
                    )
                  }
                  disabled={isLoading || !canCancelOrder(currentStage, UserRole.Driver)}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
              </>
            );
          case DriverAcceptanceStatus.ARRIVED:
            return (
              <button
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                onClick={() =>
                  onDriverAction(
                    DriverAcceptanceStatus.PICKED_UP,
                    Action.inProgress,
                    'Поездка начата',
                    'Не удалось начать поездку',
                  )
                }
                disabled={isLoading}
              >
                {isLoading ? 'Обновляется...' : 'Начать поездку'}
              </button>
            );
          case DriverAcceptanceStatus.PICKED_UP:
            return (
              <button
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                onClick={() =>
                  onDriverAction(
                    DriverAcceptanceStatus.COMPLETED,
                    Action.success,
                    `Заказ #${notification.orderId?.slice(0, 5)} завершён`,
                    'Не удалось завершить поездку',
                  )
                }
                disabled={isLoading}
              >
                {isLoading ? 'Завершается...' : 'Завершить поездку'}
              </button>
            );
          case DriverAcceptanceStatus.COMPLETED:
            return (
              <button
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
                onClick={onClose}
              >
                Поездка завершена
              </button>
            );
          case DriverAcceptanceStatus.TIMEOUT:
            return (
              <button
                className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
                onClick={onClose}
              >
                Заказ просрочен
              </button>
            );
          default:
            return null;
        }
      case Action.noted:
        return notification.read ? (
          <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition">
            Уведомление прочитано
          </button>
        ) : (
          <button
            onClick={onMarkAsRead}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Ознакомился
          </button>
        );
      case Action.warning:
        return (
          <>
            <button
              className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition"
              onClick={() =>
                onDriverAction(
                  DriverAcceptanceStatus.ACCEPTED,
                  Action.inProgress,
                  `Заказ #${notification.orderId?.slice(0, 5)} принят`,
                  'Не удалось принять заказ',
                )
              }
              disabled={isLoading}
            >
              {isLoading ? 'Принимается...' : 'Взять заказ'}
            </button>
            <button
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              onClick={() =>
                onDriverAction(
                  DriverAcceptanceStatus.PENDING,
                  Action.cancelled,
                  `Заказ #${notification.orderId?.slice(0, 5)} отклонён`,
                  'Не удалось отклонить заказ',
                )
              }
              disabled={isLoading}
            >
              {isLoading ? 'Отклоняется...' : 'Отклонить'}
            </button>
          </>
        );
      case Action.success:
        return (
          <button
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            onClick={onClose}
          >
            Поездка завершена
          </button>
        );
      case Action.cancelled:
        return (
          <button
            className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
            onClick={onClose}
          >
            Заказ отменён
          </button>
        );
      default:
        return null;
    }
  }

  return null;
};
