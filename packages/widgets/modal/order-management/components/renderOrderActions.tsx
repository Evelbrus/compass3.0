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
  { id: 'changed_mind', label: 'Передумал, нашел другой транспорт' },
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

  // Состояние для отображения модального окна отмены
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

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

  // Функция для обработки отмены заказа клиентом
  const handleClientCancelOrder = () => {
    if (!selectedReason) {
      alert('Пожалуйста, выберите причину отмены');
      return;
    }
    closeCancellationModal();
    onCancelOrder(); // Просто вызываем функцию отмены без передачи причины
  };

  // Модальное окно выбора причины отмены - общее для водителя и клиента
  const cancellationModal = isCancellationModalOpen ? (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] max-w-[90%]">
        <h3 className="text-xl font-semibold mb-4">Укажите причину отмены</h3>
        <div className="space-y-2 mb-6">
          {mockCancellationReasons.map((reason) => (
            <div
              key={reason.id}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                selectedReason === reason.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedReason(reason.id)}
            >
              {reason.label}
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            onClick={closeCancellationModal}
          >
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            disabled={!selectedReason}
            onClick={
              userRole === UserRole.Driver ? handleDriverCancelOrder : handleClientCancelOrder
            }
          >
            Отменить заказ
          </button>
        </div>
      </div>
    </div>
  ) : null;

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
        return (
          <>
            {notification.read ? (
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
            )}
            {cancellationModal}
          </>
        );
      case OrderStatus.IN_PROGRESS:
        // Клиент может отменить, только если водитель еще не начал поездку
        if (currentStage < DriverAcceptanceStatus.PICKED_UP) {
          return (
            <>
              <button
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                onClick={openCancellationModal}
                disabled={isLoading}
              >
                {isLoading ? 'Отмена...' : 'Отменить заказ'}
              </button>
              {cancellationModal}
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
                onClick={openCancellationModal}
                disabled={isLoading}
              >
                {isLoading ? 'Отмена...' : 'Отменить заказ'}
              </button>
              {cancellationModal}
            </>
          );
        }
        return null;
      case OrderStatus.COMPLETED:
        return (
          <>
            <button
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
              onClick={onClose}
            >
              Поездка завершена
            </button>
            {cancellationModal}
          </>
        );
      case OrderStatus.CANCELLED:
        return (
          <>
            <button
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
              onClick={onClose}
            >
              Заказ отменен
            </button>
            {cancellationModal}
          </>
        );
      default:
        return cancellationModal;
    }
  }

  // Для водителя
  if (userRole === UserRole.Driver && onDriverAction) {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <>
            {notification.read ? (
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
            )}
            {cancellationModal}
          </>
        );
      case OrderStatus.PLANNED:
        return (
          <>
            {notification.read ? (
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
            )}
            {cancellationModal}
          </>
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
                {cancellationModal}
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
                  onClick={openCancellationModal}
                  disabled={isLoading}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
                {cancellationModal}
              </>
            );
          // Аналогично для остальных этапов - добавьте {cancellationModal} ко всем JSX блокам
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
                  onClick={openCancellationModal}
                  disabled={isLoading}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
                {cancellationModal}
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
                  onClick={openCancellationModal}
                  disabled={isLoading}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
                {cancellationModal}
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
                  onClick={openCancellationModal}
                  disabled={isLoading}
                >
                  {isLoading ? 'Отменяется...' : 'Отменить заказ'}
                </button>
                {cancellationModal}
              </>
            );
          case DriverAcceptanceStatus.COMPLETED:
            return (
              <>
                <button
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
                  onClick={onClose}
                >
                  Поездка завершена
                </button>
                {cancellationModal}
              </>
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
                  onClick={openCancellationModal}
                  disabled={isLoading}
                >
                  {isLoading ? 'Отклоняется...' : 'Отклонить'}
                </button>
                {cancellationModal}
              </>
            );
          default:
            return cancellationModal;
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
              onClick={openCancellationModal}
              disabled={isLoading}
            >
              {isLoading ? 'Отклоняется...' : 'Отклонить'}
            </button>
            {cancellationModal}
          </>
        );
      case OrderStatus.COMPLETED:
        return (
          <>
            <button
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
              onClick={onClose}
            >
              Поездка завершена
            </button>
            {cancellationModal}
          </>
        );
      case OrderStatus.CANCELLED:
        return (
          <>
            <button
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition"
              onClick={onClose}
            >
              Заказ отменён
            </button>
            {cancellationModal}
          </>
        );
      default:
        return cancellationModal;
    }
  }

  return null;
};
