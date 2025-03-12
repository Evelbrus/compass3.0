import { DriverAcceptanceStatus, Order, OrderStatus } from '@prisma/client';

export interface OrderWithDetails extends Order {
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  createdBy: { fullName: string };
  assignedDriver: { fullName: string } | null;
}

/**
 * Шаблоны уведомлений для различных событий системы такси/трансфера
 */
export const notificationTemplates = {
  // Уведомления для водителей
  driverOrderAssigned: {
    title: (order: OrderWithDetails) => `Вам назначен новый заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Вам назначен заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}. Пожалуйста, примите или отклоните заказ.`,
  },

  // Уведомления для водителей
  clientCorpOrderAssigned: {
    title: (order: OrderWithDetails) => `Вам создан заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) => `Вам создан заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}.`,
  },

  // Уведомления для администратора (создателя заказа)
  adminOrderAssigned: {
    title: (order: OrderWithDetails) => `Вы создали заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) => `Вами создан заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}.`,
  },

  driverOrderAccepted: {
    title: (order: OrderWithDetails) => `Вы приняли заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Вы приняли заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}. Направляйтесь к точке отправления.`,
  },

  driverOrderCancelled: {
    title: (order: OrderWithDetails) => `Заказ отменен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} был отменен. Клиент: ${clientFullName}.`,
  },

  driverOnTheWay: {
    title: (order: OrderWithDetails) => `Вы в пути к клиенту`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Вы в пути к клиенту для выполнения заказа ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  driverArrived: {
    title: (order: OrderWithDetails) => `Вы прибыли к клиенту`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Вы прибыли к точке отправления для заказа ${orderName} (${departureAddress}). Клиент: ${clientFullName}.`,
  },

  driverPickedUp: {
    title: (order: OrderWithDetails) => `Вы забрали клиента`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Вы забрали клиента и начали поездку по заказу ${orderName} с маршрутом ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  driverOrderCompleted: {
    title: (order: OrderWithDetails) => `Заказ выполнен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Вы успешно выполнили заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  driverOrderTimeout: {
    title: (order: OrderWithDetails) => `Время ответа на заказ истекло`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
    ) =>
      `Время ответа на заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} истекло. Заказ переназначен другому водителю.`,
  },

  // Уведомления для клиентов
  clientOrderCreated: {
    title: (order: OrderWithDetails) => `Заказ создан`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
    ) =>
      `Ваш заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} успешно создан. Ожидайте назначения водителя.`,
  },

  clientOrderPlanned: {
    title: (order: OrderWithDetails) => `Заказ запланирован`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
    ) =>
      `Ваш заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} запланирован. Водитель будет назначен ближе к времени поездки.`,
  },

  clientDriverAssigned: {
    title: (order: OrderWithDetails) => `Водитель назначен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `На ваш заказ ${orderName} назначен водитель ${driverFullName || 'Не указан'}. Маршрут: ${departureAddress} → ${arrivalAddress}.`,
  },

  clientDriverAccepted: {
    title: (order: OrderWithDetails) => `Водитель принял заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} принял ваш заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Водитель направляется к точке отправления.`,
  },

  clientDriverOnTheWay: {
    title: (order: OrderWithDetails) => `Водитель в пути`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} в пути к точке отправления (${departureAddress}) для вашего заказа ${orderName}.`,
  },

  clientDriverArrived: {
    title: (order: OrderWithDetails) => `Водитель прибыл`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} прибыл к точке отправления (${departureAddress}) для вашего заказа ${orderName}.`,
  },

  clientDriverPickedUp: {
    title: (order: OrderWithDetails) => `Поездка началась`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Ваша поездка по заказу ${orderName} началась. Водитель: ${driverFullName || 'Не указан'}. Маршрут: ${departureAddress} → ${arrivalAddress}.`,
  },

  clientOrderCompleted: {
    title: (order: OrderWithDetails) => `Поездка завершена`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Ваша поездка по заказу ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} успешно завершена. Спасибо за использование нашего сервиса!`,
  },

  clientOrderCancelled: {
    title: (order: OrderWithDetails) => `Заказ отменен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Ваш заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} был отменен${driverFullName ? ` водителем ${driverFullName}` : ''}.`,
  },

  clientDriverTimeout: {
    title: (order: OrderWithDetails) => `Заказ переназначается`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
    ) =>
      `Водитель не ответил вовремя на ваш заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Заказ переназначается другому водителю.`,
  },

  // Уведомления для администраторов
  adminOrderCreated: {
    title: (order: OrderWithDetails) => `Создан новый заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Создан новый заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  adminOrderPlanned: {
    title: (order: OrderWithDetails) => `Заказ запланирован`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Заказ ${orderName} запланирован по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  adminDriverAssigned: {
    title: (order: OrderWithDetails) => `Водитель назначен на заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} назначен на заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  adminDriverAccepted: {
    title: (order: OrderWithDetails) => `Водитель принял заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} принял заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  adminDriverOnTheWay: {
    title: (order: OrderWithDetails) => `Водитель в пути к клиенту`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} в пути к клиенту для заказа ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  adminDriverArrived: {
    title: (order: OrderWithDetails) => `Водитель прибыл к клиенту`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} прибыл к клиенту для заказа ${orderName} в точке ${departureAddress}. Клиент: ${clientFullName}.`,
  },

  adminDriverPickedUp: {
    title: (order: OrderWithDetails) => `Поездка началась`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} забрал клиента и начал поездку по заказу ${orderName}. Маршрут: ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  adminOrderCompleted: {
    title: (order: OrderWithDetails) => `Заказ выполнен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} успешно выполнен. Клиент: ${clientFullName}. Водитель: ${driverFullName || 'Не указан'}.`,
  },

  adminOrderCancelled: {
    title: (order: OrderWithDetails) => `Заказ отменен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} был отменен. Клиент: ${clientFullName}. Водитель: ${driverFullName || 'Не указан'}.`,
  },

  adminOrderTimeout: {
    title: (order: OrderWithDetails) => `Водитель не ответил на заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} не ответил на заказ ${orderName} в течение отведенного времени. Клиент: ${clientFullName}. Требуется переназначение водителя.`,
  },

  // Системные уведомления
  systemOrderOverdue: {
    title: (order: OrderWithDetails) => `Заказ просрочен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} просрочен. Клиент: ${clientFullName}. Водитель: ${driverFullName || 'Не указан'}.`,
  },

  systemDriverNoShow: {
    title: (order: OrderWithDetails) => `Водитель не прибыл`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} не прибыл для выполнения заказа ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}.`,
  },

  orderInProgressClient: {
    title: (order: OrderWithDetails) => `Ваш заказ в процессе выполнения. Водитель уже в пути.`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Ваш заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} находится в процессе выполнения. Водитель ${driverFullName || 'Не указан'} уже в пути.`,
  },

  orderInProgressDriver: {
    title: (order: OrderWithDetails) =>
      `Выполнение заказа начнется через 1 минуту. Возьмите заказ в работу.`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} начнется через 1 минуту, возьмите его в работу. Клиент: ${clientFullName}.`,
  },

  orderOverdueDriver: {
    title: (order: OrderWithDetails) => `Заказ просрочен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Время выполнения заказа ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} уже наступило. Клиент ${clientFullName} ожидает вас в ${new Date(order.departureTime).toLocaleTimeString()}.`,
  },

  // Шаблон для администратора о просроченном заказе
  orderOverdueAdmin: {
    title: (order: OrderWithDetails) => `Заказ просрочен`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress} просрочен. Клиент: ${clientFullName}. Водитель: ${driverFullName || 'Не назначен'}. Время отправления: ${new Date(order.departureTime).toLocaleString()}. Примите действия!`,
  },
  clientOrderNotified: {
    title: (order: OrderWithDetails) => `Напоминание о вашем заказе`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Напоминаем о вашем заказе ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Время отправления: ${new Date(order.departureTime).toLocaleString()}. ${driverFullName ? `Ваш водитель: ${driverFullName}.` : 'Водитель будет назначен в ближайшее время.'}`,
  },

  // Шаблон для водителя о предстоящем заказе
  driverOrderNotified: {
    title: (order: OrderWithDetails) => `Напоминание о заказе`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Напоминаем о назначенном вам заказе ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}. Время отправления: ${new Date(order.departureTime).toLocaleString()}.`,
  },

  // Шаблон для администратора о предстоящем заказе
  adminOrderNotified: {
    title: (order: OrderWithDetails) => `Напоминание о заказе`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Обратите внимание на заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}. ${driverFullName ? `Водитель: ${driverFullName}.` : 'Водитель не назначен.'} Время отправления: ${new Date(order.departureTime).toLocaleString()}.`,
  },
  driverAcceptedOverdue: {
    title: (order: OrderWithDetails) => `Вы приняли просроченный заказ №${order.uuid}`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Вы приняли просроченный заказ ${orderName}. Маршрут: ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}. Пожалуйста, свяжитесь с администратором для уточнения деталей.`,
  },

  adminDriverAcceptedOverdue: {
    title: (order: OrderWithDetails) => `Водитель принял просроченный заказ №${order.uuid}`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} принял просроченный заказ ${orderName}. Маршрут: ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}. Пожалуйста, проверьте статус заказа.`,
  },
};

/**
 * Получает шаблон уведомления на основе статуса заказа и водителя
 * @param orderStatus Статус заказа
 * @param driverStatus Статус принятия заказа водителем
 * @param forRole Роль получателя уведомления (driver, client, admin)
 * @returns Ключ шаблона уведомления
 */
export function getNotificationTemplateKey(
  orderStatus: OrderStatus,
  driverStatus: DriverAcceptanceStatus,
  forRole: 'driver' | 'client' | 'admin',
  previousDriverStatus?: DriverAcceptanceStatus | null,
): keyof typeof notificationTemplates {
  console.log('orderStatus', orderStatus);
  console.log('driverStatus', driverStatus);
  console.log('previousDriverStatus', previousDriverStatus);

  // Специальный случай: заказ был просрочен (TIMEOUT), и теперь принят
  if (
    previousDriverStatus === DriverAcceptanceStatus.TIMEOUT &&
    orderStatus === OrderStatus.IN_PROGRESS && // После timeout заказ переходит в IN_PROGRESS
    driverStatus === DriverAcceptanceStatus.ACCEPTED // Водитель принял заказ
  ) {
    if (forRole === 'driver') {
      return 'driverAcceptedOverdue'; // "Вы приняли просроченный заказ"
    }
    if (forRole === 'admin') {
      return 'adminDriverAcceptedOverdue'; // "Водитель принял просроченный заказ"
    }
  }

  // Проверяем статус NOTIFIED
  if (driverStatus === DriverAcceptanceStatus.NOTIFIED) {
    if (forRole === 'driver') return 'driverOrderNotified';
    else if (forRole === 'client') return 'clientOrderNotified';
    else return 'adminOrderNotified';
  }

  // Для водителя
  if (forRole === 'driver') {
    switch (orderStatus) {
      case OrderStatus.PENDING:
        return 'driverOrderAssigned';
      case OrderStatus.PLANNED:
        return 'driverOrderAssigned';
      case OrderStatus.IN_PROGRESS:
        if (driverStatus === DriverAcceptanceStatus.ACCEPTED) return 'driverOrderAccepted';
        else if (driverStatus === DriverAcceptanceStatus.ON_THE_WAY) return 'driverOnTheWay';
        else if (driverStatus === DriverAcceptanceStatus.ARRIVED) return 'driverArrived';
        else if (driverStatus === DriverAcceptanceStatus.PICKED_UP) return 'driverPickedUp';
        else return 'driverOrderAccepted';
      case OrderStatus.COMPLETED:
        return 'driverOrderCompleted';
      case OrderStatus.CANCELLED:
        return 'driverOrderCancelled';
      case OrderStatus.OVERDUE:
        return 'systemOrderOverdue';
      default:
        return 'driverOrderAssigned';
    }
  }

  // Для клиента
  if (forRole === 'client') {
    switch (orderStatus) {
      case OrderStatus.PENDING:
        if (driverStatus === DriverAcceptanceStatus.PENDING || driverStatus === null)
          return 'clientOrderCreated';
        if (driverStatus === DriverAcceptanceStatus.TIMEOUT) return 'clientDriverTimeout';
        return 'clientDriverAssigned';
      case OrderStatus.PLANNED:
        return 'clientOrderPlanned';
      case OrderStatus.IN_PROGRESS:
        if (driverStatus === DriverAcceptanceStatus.ACCEPTED) return 'clientDriverAccepted';
        else if (driverStatus === DriverAcceptanceStatus.ON_THE_WAY) return 'clientDriverOnTheWay';
        else if (driverStatus === DriverAcceptanceStatus.ARRIVED) return 'clientDriverArrived';
        else if (driverStatus === DriverAcceptanceStatus.PICKED_UP) return 'clientDriverPickedUp';
        return 'clientDriverAssigned';
      case OrderStatus.COMPLETED:
        return 'clientOrderCompleted';
      case OrderStatus.CANCELLED:
        return 'clientOrderCancelled';
      case OrderStatus.OVERDUE:
        return 'systemOrderOverdue';
      default:
        return 'clientOrderCreated';
    }
  }

  // Для администратора
  if (forRole === 'admin') {
    switch (orderStatus) {
      case OrderStatus.PENDING:
        if (driverStatus === DriverAcceptanceStatus.PENDING || driverStatus === null)
          return 'adminOrderCreated';
        if (driverStatus === DriverAcceptanceStatus.TIMEOUT) return 'adminOrderTimeout';
        return 'adminDriverAssigned';
      case OrderStatus.PLANNED:
        return 'adminOrderPlanned';
      case OrderStatus.IN_PROGRESS:
        if (driverStatus === DriverAcceptanceStatus.ACCEPTED) return 'adminDriverAccepted';
        else if (driverStatus === DriverAcceptanceStatus.ON_THE_WAY) return 'adminDriverOnTheWay';
        else if (driverStatus === DriverAcceptanceStatus.ARRIVED) return 'adminDriverArrived';
        else if (driverStatus === DriverAcceptanceStatus.PICKED_UP) return 'adminDriverPickedUp';
        return 'adminDriverAssigned';
      case OrderStatus.COMPLETED:
        return 'adminOrderCompleted';
      case OrderStatus.CANCELLED:
        return 'adminOrderCancelled';
      case OrderStatus.OVERDUE:
        return 'systemOrderOverdue';
      default:
        return 'adminOrderCreated';
    }
  }

  return 'driverOrderAssigned'; // Значение по умолчанию
}

/**
 * Определяет должно ли уведомление быть отмечено как прочитанное по умолчанию
 * @param templateKey Ключ шаблона уведомления
 * @param forRole Роль получателя
 * @returns Должно ли уведомление быть отмечено как прочитанное
 */
export function shouldMarkAsRead(
  templateKey: keyof typeof notificationTemplates,
  forRole: 'driver' | 'client' | 'admin',
): boolean {
  // Возвращаем false для всех уведомлений, чтобы все были непрочитанными по умолчанию
  return false;
}
