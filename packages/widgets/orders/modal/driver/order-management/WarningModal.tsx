import React from 'react';
import { DriverAcceptanceStatus, OrderStatus, Action, Notification } from '@prisma/client';
import { updateOrderStatus } from '@widgets/orders/modal/driver/api/apiDriverModel';
import { useSocket } from '@shared/utils/hooks/useSocket';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  getDriverNotifications: (driverId: string) => Notification[];
}

const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  notification,
  getDriverNotifications,
}) => {
  const socket = useSocket('notification');

  const handleAcceptOrder = async () => {
    try {
      const driverNotifications = getDriverNotifications(notification.userId);
      const hasActiveOrder = driverNotifications.some(
        (n) =>
          n.userId === notification.userId &&
          n.action === Action.inProgress &&
          n.orderId !== notification.orderId,
      );
      if (hasActiveOrder) {
        alert('Вы не можете принять новый заказ, пока не завершите текущий');
        return;
      }

      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: DriverAcceptanceStatus.TAKEN,
        orderStatus: OrderStatus.IN_PROGRESS,
        driverId: notification.userId,
        notificationUuid: notification.uuid,
        markNotificationAsRead: true,
        action: Action.inProgress,
      });

      if (socket) {
        const updatedNotification = {
          uuid: notification.uuid,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          orderId: notification.orderId,
          action: Action.inProgress,
          read: true,
        };
        console.log('Отправляем WebSocket-уведомление (принятие):', updatedNotification);
        socket.emit('notification', {
          userId: notification.userId,
          notification: updatedNotification,
        });
      }

      onClose();
    } catch (err) {
      console.error('Ошибка при принятии заказа:', err);
    }
  };

  const handleRejectOrder = async () => {
    try {
      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: DriverAcceptanceStatus.TIMEOUT,
        orderStatus: OrderStatus.CANCELLED,
        driverId: notification.userId,
        notificationUuid: notification.uuid,
        markNotificationAsRead: true,
        action: Action.cancelled,
      });

      if (socket) {
        const updatedNotification = {
          uuid: notification.uuid,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          orderId: notification.orderId,
          action: Action.cancelled,
          read: true,
        };
        console.log('Отправляем WebSocket-уведомление (отклонение):', updatedNotification);
        socket.emit('notification', {
          userId: notification.userId,
          notification: updatedNotification,
        });
      }

      onClose();
    } catch (err) {
      console.error('Ошибка при отклонении заказа:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]">
        <h2 className="text-xl font-semibold mb-4">Просроченный заказ</h2>
        <p className="mb-4">
          Заказ #{notification.orderId} поступил с просрочкой. Вы можете взять его или отклонить.
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleAcceptOrder}
          >
            Взять заказ
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={handleRejectOrder}
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
