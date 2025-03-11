import React, { useState } from 'react';
import {
  UserRole,
  OrderStatus,
  DriverAcceptanceStatus,
  type Notification as PrismaNotification,
} from '@prisma/client';
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
    orderStatus: OrderStatus,
    reason: string,
    successMessage: string,
    errorMessage: string,
  ) => void;
  onEditOrder?: () => void;
  onClose: () => void;
  orderStatus?: OrderStatus;
}

// Хелпер-функция для обработки null в строках
const safeStr = (str: string | null): string => str || '';

// Тип для причин отмены (замените на ваш реальный тип)
type CancellationReason = {
  id: string;
  label: string;
};

const mockCancellationReasons: CancellationReason[] = [
  { id: 'no_longer_available', label: 'Заказ больше не актуален' },
  { id: 'technical_issue', label: 'Технические проблемы' },
  { id: 'client_unavailable', label: 'Клиент не выходит на связь' },
  { id: 'client_unavailable', label: 'Клиент не выходит на связь' },
  { id: 'other', label: 'Другая причина' },
];

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
  orderStatus = OrderStatus.PENDING, // По умолчанию PENDING
}: RenderOrderActionsProps) => {
  // Используем переданный статус заказа
  const status = orderStatus;

  // Состояние для отображения модального окна отмены водителем
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null); // Add state for selected reason

  // Функция для открытия модального окна отмены
  const openCancellationModal = () => {
    setIsCancellationModalOpen(true);
  };

  // Функция для закрытия модального окна отмены
  const closeCancellationModal = () => {
    setIsCancellationModalOpen(false);
    setSelectedReason(null); // Reset selected reason when closing modal
  };

  // Функция для обработки отмены заказа водителем с указанной причиной
  const handleDriverCancelOrder = () => {
    if (!selectedReason) {
      alert('Пожалуйста, выберите причину отмены'); // Замените на более красивое уведомление
      return;
    }
    if (onDriverAction) {
      onDriverAction(
        DriverAcceptanceStatus.PENDING,
        OrderStatus.CANCELLED,
        selectedReason, // Pass the selected reason
        `Заказ #${safeStr(notification.orderId).slice(0, 5)} отменён водителем`,
        'Не удалось отменить заказ',
      );
      closeCancellationModal();
    }
  };

  // Для администратора
  if (userRole === UserRole.Admin) {
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
      </>
    );
  }

  // Для клиента корпоративного
  if (userRole === UserRole.ClientCorp) {
    switch (status) {
      case OrderStatus.PENDING:
      case OrderStatus.PLANNED:
        return notification.read ? (
          <>
            <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition">
              Уведомление прочитано
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
            >
              Закрыть
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onMarkAsRead}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Ознакомился
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
            >
              Закрыть
            </button>
          </>
        );
      case OrderStatus.IN_PROGRESS:
        // Клиент может отменить, только если водитель еще не начал поездку
        if (currentStage < DriverAcceptanceStatus.PICKED_UP) {
          return (
            <>
              <button
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                onClick={onCancelOrder}
                disabled={isLoading}
              >
                {isLoading ? 'Отмена...' : 'Отменить заказ'}
              </button>
            </>
          );
        }
        return null; // Кнопка отмены не отображается, если водитель уже начал поездку
      case OrderStatus.OVERDUE:
        // Клиент может отменить, только если водитель еще не начал поездку
        if (currentStage < DriverAcceptanceStatus.PICKED_UP) {
          return (
            <>
              <button
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                onClick={onCancelOrder}
                disabled={isLoading}
              >
                {isLoading ? 'Отмена...' : 'Отменить заказ'}
              </button>
            </>
          );
        }
        return null; // Кнопка отмены не отображается, если водитель уже начал поездку
      case OrderStatus.COMPLETED:
        return (
          <button
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            onClick={onClose}
          >
            Поездка завершена
          </button>
        );
      case OrderStatus.CANCELLED:
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
    switch (status) {
      case OrderStatus.PENDING:
        return notification.read ? (
          <>
            <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition">
              Уведомление прочитано
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
            >
              Закрыть
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onMarkAsRead}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Ознакомился
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
            >
              Закрыть
            </button>
          </>
        );
      case OrderStatus.PLANNED:
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
      case OrderStatus.IN_PROGRESS:
        switch (currentStage) {
          case DriverAcceptanceStatus.PENDING:
          case DriverAcceptanceStatus.NOTIFIED:
            return (
              <>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.ACCEPTED,
                      OrderStatus.IN_PROGRESS,
                      '',
                      `Заказ #${safeStr(notification.orderId).slice(0, 5)} принят`,
                      'Не удалось принять заказ',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Принимается...' : 'Принять заказ'}
                </button>
                <button
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                  onClick={openCancellationModal}
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
                      OrderStatus.IN_PROGRESS,
                      '',
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
                  onClick={openCancellationModal} // Open modal instead of direct cancel
                  disabled={isLoading}
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
                      OrderStatus.IN_PROGRESS,
                      '',
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
                  onClick={openCancellationModal} // Open modal instead of direct cancel
                  disabled={isLoading}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
              </>
            );
          case DriverAcceptanceStatus.ARRIVED:
            return (
              <>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.PICKED_UP,
                      OrderStatus.IN_PROGRESS,
                      '',
                      'Поездка начата',
                      'Не удалось начать поездку',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Обновляется...' : 'Начать поездку'}
                </button>
                <button
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                  onClick={openCancellationModal} // Open modal instead of direct cancel
                  disabled={isLoading}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
              </>
            );
          case DriverAcceptanceStatus.PICKED_UP:
            return (
              <>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.COMPLETED,
                      OrderStatus.COMPLETED,
                      '',
                      `Заказ #${safeStr(notification.orderId).slice(0, 5)} завершён`,
                      'Не удалось завершить поездку',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Завершается...' : 'Завершить поездку'}
                </button>
                <button
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                  onClick={openCancellationModal} // Open modal instead of direct cancel
                  disabled={isLoading}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
              </>
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
              <>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() =>
                    onDriverAction(
                      DriverAcceptanceStatus.TIMEOUT,
                      OrderStatus.IN_PROGRESS,
                      '',
                      `Заказ #${safeStr(notification.orderId).slice(0, 5)} принят`,
                      'Не удалось принять заказ',
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Принимается...' : 'Принять заказ'}
                </button>
                <button
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                  onClick={openCancellationModal} // Open modal instead of direct cancel
                  disabled={isLoading}
                >
                  {isLoading ? 'Отклоняется...' : 'Отклонить'}
                </button>
              </>
            );
          default:
            return null;
        }
      case OrderStatus.OVERDUE:
        return (
          <>
            <button
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
              onClick={() =>
                onDriverAction(
                  DriverAcceptanceStatus.ACCEPTED,
                  OrderStatus.IN_PROGRESS,
                  '',
                  `Заказ #${safeStr(notification.orderId).slice(0, 5)} принят`,
                  'Не удалось принять заказ',
                )
              }
              disabled={isLoading}
            >
              {isLoading ? 'Принимается...' : 'Принять заказ'}
            </button>
            <button
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              onClick={openCancellationModal} // Open modal instead of direct cancel
              disabled={isLoading}
            >
              {isLoading ? 'Отклоняется...' : 'Отклонить'}
            </button>
          </>
        );
      case OrderStatus.COMPLETED:
        return (
          <button
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            onClick={onClose}
          >
            Поездка завершена
          </button>
        );
      case OrderStatus.CANCELLED:
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
