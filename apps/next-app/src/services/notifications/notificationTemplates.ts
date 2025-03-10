import { Order, OrderStatus, DriverAcceptanceStatus } from '@prisma/client';

// Интерфейсы для типизации
interface OrderWithDetails extends Order {
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  clientBy: { fullName: string };
  assignedDriver?: { fullName: string } | null;
}

export type NotificationTemplate = {
  title: (order: OrderWithDetails, departureAddress: string, arrivalAddress: string) => string;
  message: (
    order: OrderWithDetails,
    orderName: string,
    departureAddress: string,
    arrivalAddress: string,
    clientFullName?: string,
    driverFullName?: string | null,
  ) => string;
};

// Переводы статусов для использования в шаблонах
export const orderStatusTranslations: Record<OrderStatus, string> = {
  PENDING: 'Ожидает подтверждения',
  PLANNED: 'Запланирован',
  IN_PROGRESS: 'В процессе выполнения',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
  OVERDUE: 'Просрочен',
};

export const driverAcceptanceStatusTranslations: Record<DriverAcceptanceStatus, string> = {
  PENDING: 'Ожидает решения водителя',
  TAKEN: 'Принят к сведению водителем',
  ACCEPTED: 'Принят водителем',
  ON_THE_WAY: 'Водитель в пути к клиенту',
  ARRIVED: 'Водитель прибыл к клиенту',
  PICKED_UP: 'Водитель забрал клиента',
  TIMEOUT: 'Водитель не принял вовремя',
  COMPLETED: 'Поездка завершена',
};

// Шаблоны уведомлений
export const notificationTemplates: Record<string, NotificationTemplate> = {
  orderCreatedByAdminToAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ создан',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName, driverFullName) =>
      `<ul>
        <li>&#8226; Вы создали заказ <strong>${orderName}</strong></li>
        <li>&#8226; Для клиента <strong>${clientFullName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        ${driverFullName ? `<li>&#8226; Назначен водитель: <strong>${driverFullName}</strong></li>` : '<li>&#8226; Водитель не назначен</li>'}
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderCreatedByAdminToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ создан',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вам создан заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderCreatedDriverAssigned: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ назначен',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вам назначен заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderUpdatedByAdminToAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName, driverFullName) =>
      `<ul>
        <li>&#8226; Вы обновили заказ <strong>${orderName}</strong></li>
        <li>&#8226; Для клиента <strong>${clientFullName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        ${driverFullName ? `<li>&#8226; Назначен водитель: <strong>${driverFullName}</strong></li>` : '<li>&#8226; Водитель не назначен</li>'}
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderSuccesByAdminToAdmin: {
    title: () => 'Поездка успешно завершена',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
      <li>• Заказ <strong>${orderName}</strong> успешно завершен</li>
      <li>• Водитель: <strong>${driverFullName || 'не указан'}</strong></li>
      <li>• От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>• Время завершения: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>`,
  },
  orderUpdatedByAdminToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Ваш заказ <strong>${orderName}</strong> обновлён</li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderUpdatedDriverReassigned: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Заказ <strong>${orderName}</strong>, на который вы были назначены, был обновлён</li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderDriverRemoved: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Назначение снято',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы больше не назначены на заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления было: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderDeletedByAdminToAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ удалён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы удалили заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderDeletedByAdminToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Ваш заказ <strong>${orderName}</strong> был отменён</li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderDeletedByAdminToDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Заказ <strong>${orderName}</strong>, на который вы были назначены, был отменён</li>
         <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderCreatedByCorpClientToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ создан',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы создали заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderCreatedByCorpClientToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Новый заказ',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `<ul>
        <li>&#8226; Корпоративный клиент <strong>${clientFullName}</strong> создал заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderUpdatedByCorpClientToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы обновили заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderUpdatedByCorpClientToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `<ul>
        <li>&#8226; Корпоративный клиент <strong>${clientFullName}</strong> обновил заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderCancelledByCorpClientToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы отменили заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderCancelledByDriverToDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы отменили заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderCancelledByCorpClientToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён клиентом',
    message: (_order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `<ul>
        <li>&#8226; Корпоративный клиент <strong>${clientFullName}</strong> отменил заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderCancelledByCorpClientToDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `<ul>
        <li>&#8226; Заказ <strong>${orderName}</strong>, на который вы были назначены, был отменён клиентом <strong>${clientFullName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderStatusChangedToClient: {
    title: (order, _departureAddress, _arrivalAddress) =>
      order.status === 'COMPLETED' ? 'Поездка успешно завершена' : 'Статус заказа изменён',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
        <li>&#8226; Ваш заказ <strong>${orderName}</strong> теперь в статусе "<strong>${orderStatusTranslations[order.status]}</strong>"</li>
        ${driverFullName ? `<li>&#8226; Статус водителя: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'PENDING']}</strong>"</li>` : ''}
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderCancelledByDriverToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (
      _order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
        <li>&#8226; Ваш заказ <strong>${orderName}</strong> был отменён водителем <strong>${driverFullName || 'не указан'}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderCancelledByDriverToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (
      _order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
        <li>&#8226; Водитель <strong>${driverFullName || 'не указан'}</strong> отменил заказ <strong>${orderName}</strong></li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      </ul>`,
  },
  orderInProgressDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Поездка начинается',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      _driverFullName,
    ) =>
      `<ul>
        <li>&#8226; Заказ <strong>${orderName}</strong> в статусе "<strong>${orderStatusTranslations[order.status]}</strong>"</li>
        <li>&#8226; Ваш текущий статус: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'PENDING']}</strong>"</li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
        <li>&#8226; Поездка начнётся через минуту</li>
      </ul>`,
  },
  orderInProgressClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Поездка начинается',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
        <li>&#8226; Ваш заказ <strong>${orderName}</strong> в статусе "<strong>${orderStatusTranslations[order.status]}</strong>"</li>
        <li>&#8226; Водитель: <strong>${driverFullName || 'не указан'}</strong></li>
        <li>&#8226; Статус водителя: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'PENDING']}</strong>"</li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
        <li>&#8226; Поездка скоро начнётся</li>
      </ul>`,
  },
  orderOverdueDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Просроченный заказ',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Заказ <strong>${orderName}</strong> просрочен</li>
        <li>&#8226; Ваш статус: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'TIMEOUT']}</strong>"</li>
        <li>&#8226; Время отправления было: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderOverdueAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Просроченный заказ',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
        <li>&#8226; Заказ <strong>${orderName}</strong> просрочен</li>
        <li>&#8226; Водитель <strong>${driverFullName || 'не указан'}</strong> не принял заказ вовремя (статус: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'TIMEOUT']}</strong>")</li>
        <li>&#8226; Время отправления было: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderOverdueAcceptedByDriverToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Просроченный заказ принят',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
        <li>&#8226; Водитель <strong>${driverFullName || 'не указан'}</strong> принял просроченный заказ <strong>${orderName}</strong></li>
        <li>&#8226; Статус водителя: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'ACCEPTED']}</strong>"</li>
        <li>&#8226; Время отправления было: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderNotedByDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Уведомление',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы отметили уведомление о заказе <strong>${orderName}</strong> как прочитанное</li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderNotedByClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Уведомление',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы отметили уведомление о заказе <strong>${orderName}</strong> как прочитанное</li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderNotedByAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Уведомление',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
        <li>&#8226; Вы отметили уведомление о заказе <strong>${orderName}</strong> как прочитанное</li>
        <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
        <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
      </ul>`,
  },
  orderUpdatedByDriverToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ принят водителем',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
      <li>&#8226; Водитель <strong>${driverFullName || 'не указан'}</strong> принял заказ <strong>${orderName}</strong></li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>&#8226; Статус водителя: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'ACCEPTED']}</strong>"</li>
      <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
    </ul>`,
  },
  orderCompletedByDriverToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ выполнен',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName, driverFullName) =>
      `<ul>
      <li>&#8226; Водитель <strong>${driverFullName || 'не указан'}</strong> успешно выполнил заказ <strong>${orderName}</strong></li>
      <li>&#8226; Для клиента <strong>${clientFullName}</strong></li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>&#8226; Время завершения: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>`,
  },
  orderAutoCancelledAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ автоматически отменен',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName, driverFullName) =>
      `<ul>
      <li>&#8226; Заказ <strong>${orderName}</strong> был автоматически отменен системой из-за истечения времени ожидания</li>
      <li>&#8226; Клиент: <strong>${clientFullName}</strong></li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      ${driverFullName ? `<li>&#8226; Назначенный водитель: <strong>${driverFullName}</strong></li>` : ''}
      <li>&#8226; Время отмены: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>`,
  },
  orderCancelledClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменен',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
      <li>&#8226; Ваш заказ <strong>${orderName}</strong> был отменен из-за длительного простоя</li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>&#8226; Время отмены: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>`,
  },
  orderCancelledDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменен',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
      <li>&#8226; Заказ <strong>${orderName}</strong> был отменен из-за длительного простоя</li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>&#8226; Время отмены: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>`,
  },
  orderAcceptedByDriverToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ принят водителем',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName, driverFullName) =>
      `<ul>
      <li>&#8226; Водитель <strong>${driverFullName || 'не указан'}</strong> принял заказ <strong>${orderName}</strong></li>
      <li>&#8226; Для клиента <strong>${clientFullName}</strong></li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>&#8226; Статус водителя: "<strong>${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'ACCEPTED']}</strong>"</li>
      <li>&#8226; Время отправления: <strong>${order.departureTime.toLocaleString()}</strong></li>
    </ul>`,
  },
  orderAutoCancelledClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменен',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
      <li>&#8226; Ваш заказ <strong>${orderName}</strong> был автоматически отменен</li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>&#8226; Причина: заказ не был обработан вовремя</li>
    </ul>`,
  },
  orderAutoCancelledDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменен',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `<ul>
      <li>&#8226; Заказ <strong>${orderName}</strong> был автоматически отменен</li>
      <li>&#8226; От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>&#8226; Причина: длительное отсутствие активности</li>
    </ul>`,
  },
  orderCompletedByDriver: {
    title: () => 'Поездка завершена',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `<ul>
      <li>• Вы успешно завершили заказ <strong>${orderName}</strong></li>
      <li>• Для клиента <strong>${clientFullName}</strong></li>
      <li>• От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>• Время завершения: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>`,
  },
  orderCompletedToClient: {
    title: () => 'Поездка успешно завершена',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `<ul>
      <li>• Ваш заказ <strong>${orderName}</strong> успешно завершен</li>
      <li>• Водитель: <strong>${driverFullName || 'не указан'}</strong></li>
      <li>• От <strong>${departureAddress}</strong> до <strong>${arrivalAddress}</strong></li>
      <li>• Время завершения: <strong>${new Date().toLocaleString()}</strong></li>
    </ul>`,
  },
};
