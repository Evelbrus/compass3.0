import React from 'react';
import { DriverAcceptanceStatus, OrderStatus, Action, Notification } from '@prisma/client';
import { updateOrderStatus } from '@widgets/orders/modal/driver/api/apiDriverModel';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import { showToast } from '@shared/components/toast/ToastManager';

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
        showToast.error('Вы не можете принять новый заказ, пока не завершите текущий', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }

      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: DriverAcceptanceStatus.ACCEPTED,
        orderStatus: OrderStatus.IN_PROGRESS,
        userId: notification.userId, // Исправлено с driverId на userId
        createdById: notification.createdById, // Добавлено обязательное поле
        notificationUuid: notification.uuid,
        markNotificationAsRead: false,
        action: Action.inProgress,
      });

      if (socket) {
        const updatedDriverNotification = {
          uuid: notification.uuid,
          userId: notification.userId,
          title: notification.title,
          message: `Вы приняли заказ #${notification.orderId}`,
          orderId: notification.orderId,
          action: Action.inProgress,
          read: false,
          createdById: notification.createdById,
          createdAt:
            typeof notification.createdAt === 'string'
              ? notification.createdAt
              : notification.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log(
          'Отправляем WebSocket-уведомление (принятие водителю):',
          updatedDriverNotification,
        );
        socket.emit('notification', {
          userId: notification.userId,
          notification: updatedDriverNotification,
        });
      }

      showToast.success(`Заказ #${notification.orderId} успешно принят`, {
        position: 'top-right',
        autoClose: 3000,
      });
      onClose();
    } catch (err) {
      console.error('Ошибка при принятии заказа:', err);
      showToast.error('Не удалось принять заказ. Попробуйте снова.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleRejectOrder = async () => {
    try {
      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: DriverAcceptanceStatus.TIMEOUT,
        orderStatus: OrderStatus.CANCELLED,
        userId: notification.userId, // Исправлено с driverId на userId
        createdById: notification.createdById, // Добавлено обязательное поле
        notificationUuid: notification.uuid,
        markNotificationAsRead: true,
        action: Action.cancelled,
      });

      if (socket) {
        const updatedNotification = {
          uuid: notification.uuid,
          userId: notification.userId,
          title: notification.title,
          message: `Вы отклонили заказ #${notification.orderId}`,
          orderId: notification.orderId,
          action: Action.cancelled,
          read: true,
          createdById: notification.createdById,
          createdAt:
            typeof notification.createdAt === 'string'
              ? notification.createdAt
              : notification.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log('Отправляем WebSocket-уведомление (отклонение):', updatedNotification);
        socket.emit('notification', {
          userId: notification.userId,
          notification: updatedNotification,
        });
      }

      showToast.warn(`Заказ #${notification.orderId} отклонён`, {
        position: 'top-right',
        autoClose: 3000,
      });
      onClose();
    } catch (err) {
      console.error('Ошибка при отклонении заказа:', err);
      showToast.error('Не удалось отклонить заказ. Попробуйте снова.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]">
        <IButton
          variant="close"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="ml-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
        >
          <CloseIcon />
        </IButton>
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