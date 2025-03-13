import { DriverAcceptanceStatus, Order, OrderStatus } from '@prisma/client';
import { CancellationSource } from '@next-app/src/services/notifications/sendDriverNotifications';

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
  // Шаблон уведомления для водителя, когда клиент отменил заказ
  driverOrderCancelledByClient: {
    title: (order: OrderWithDetails) => `Клиент отменил заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
    ) =>
      `Клиент ${clientFullName} отменил заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Этот заказ больше не отображается в вашем списке активных заказов.`,
  },

  // Шаблон уведомления для администратора, когда клиент отменил заказ
  adminOrderCancelledByClient: {
    title: (order: OrderWithDetails) => `Клиент отменил заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Клиент ${clientFullName} отменил заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. ${driverFullName ? `Назначенный водитель: ${driverFullName}` : 'Водитель не был назначен'}. Время отмены: ${new Date().toLocaleString()}.`,
  },

  // Шаблон уведомления для клиента, когда водитель отменил заказ
  clientOrderCancelledByDriver: {
    title: (order: OrderWithDetails) => `Водитель отменил ваш заказ`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} отменил ваш заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Система автоматически переназначит заказ другому доступному водителю. Приносим извинения за неудобства.`,
  },

  // Шаблон уведомления для администратора, когда водитель отменил заказ
  adminOrderCancelledByDriver: {
    title: (order: OrderWithDetails) => `Водитель отменил заказ клиента`,
    message: (
      order: OrderWithDetails,
      orderName: string,
      departureAddress: string,
      arrivalAddress: string,
      clientFullName: string,
      driverFullName: string,
    ) =>
      `Водитель ${driverFullName || 'Не указан'} отменил заказ ${orderName} по маршруту ${departureAddress} → ${arrivalAddress}. Клиент: ${clientFullName}. Пожалуйста, назначьте нового водителя или свяжитесь с клиентом для уточнения деталей. Время отмены: ${new Date().toLocaleString()}.`,
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
  cancel?: CancellationSource,
): keyof typeof notificationTemplates {
  console.log('getNotificationTemplateKey - Вход:', {
    orderStatus,
    driverStatus,
    forRole,
    previousDriverStatus,
    cancel
  });

  // Специальная обработка для таймаута (TIMEOUT)
  if (driverStatus === DriverAcceptanceStatus.TIMEOUT) {
    console.log('getNotificationTemplateKey - Обнаружен TIMEOUT');

    if (forRole === 'driver') {
      console.log('getNotificationTemplateKey - Возвращаем driverOrderTimeout');
      return 'driverOrderTimeout';
    }
    else if (forRole === 'client') {
      console.log('getNotificationTemplateKey - Возвращаем clientDriverTimeout');
      return 'clientDriverTimeout';
    }
    else {
      console.log('getNotificationTemplateKey - Возвращаем adminOrderTimeout');
      return 'adminOrderTimeout';
    }
  }

  // Специальный случай: заказ был просрочен (TIMEOUT), и теперь принят
  if (
    previousDriverStatus === DriverAcceptanceStatus.TIMEOUT &&
    orderStatus === OrderStatus.IN_PROGRESS &&
    driverStatus === DriverAcceptanceStatus.ACCEPTED
  ) {
    console.log('getNotificationTemplateKey - Обработка просроченного заказа, который был принят');

    if (forRole === 'driver') {
      console.log('getNotificationTemplateKey - Возвращаем driverAcceptedOverdue');
      return 'driverAcceptedOverdue'; // "Вы приняли просроченный заказ"
    }

    if (forRole === 'admin') {
      console.log('getNotificationTemplateKey - Возвращаем adminDriverAcceptedOverdue');
      return 'adminDriverAcceptedOverdue'; // "Водитель принял просроченный заказ"
    }
  }

  // Проверяем статус NOTIFIED
  if (driverStatus === DriverAcceptanceStatus.NOTIFIED) {
    console.log('getNotificationTemplateKey - Обнаружен NOTIFIED');

    if (forRole === 'driver') {
      console.log('getNotificationTemplateKey - Возвращаем driverOrderNotified');
      return 'driverOrderNotified';
    }
    else if (forRole === 'client') {
      console.log('getNotificationTemplateKey - Возвращаем clientOrderNotified');
      return 'clientOrderNotified';
    }
    else {
      console.log('getNotificationTemplateKey - Возвращаем adminOrderNotified');
      return 'adminOrderNotified';
    }
  }

  // Обрабатываем случай отмены заказа с учетом cancel
  if (orderStatus === OrderStatus.CANCELLED) {
    console.log('getNotificationTemplateKey - Обнаружен CANCELLED с источником:', cancel);

    if (cancel === CancellationSource.CLIENT) {
      // Если заказ отменен клиентом
      if (forRole === 'driver') {
        console.log('getNotificationTemplateKey - Возвращаем driverOrderCancelledByClient');
        return 'driverOrderCancelledByClient';
      }
      else if (forRole === 'admin') {
        console.log('getNotificationTemplateKey - Возвращаем adminOrderCancelledByClient');
        return 'adminOrderCancelledByClient';
      }
      // Для клиента всегда используем один шаблон, так как он сам отменил
      else {
        console.log('getNotificationTemplateKey - Возвращаем clientOrderCancelled');
        return 'clientOrderCancelled';
      }
    } else if (cancel === CancellationSource.DRIVER) {
      // Если заказ отменен водителем
      if (forRole === 'client') {
        console.log('getNotificationTemplateKey - Возвращаем clientOrderCancelledByDriver');
        return 'clientOrderCancelledByDriver';
      }
      else if (forRole === 'admin') {
        console.log('getNotificationTemplateKey - Возвращаем adminOrderCancelledByDriver');
        return 'adminOrderCancelledByDriver';
      }
      // Для водителя всегда используем один шаблон, так как он сам отменил
      else {
        console.log('getNotificationTemplateKey - Возвращаем driverOrderCancelled');
        return 'driverOrderCancelled';
      }
    }
    // Если источник отмены не указан, используем стандартные шаблоны отмены
    console.log('getNotificationTemplateKey - Источник отмены не указан, используем стандартные шаблоны');
  }

  // Стандартная логика для остальных статусов
  let result: keyof typeof notificationTemplates;

  // Для водителя
  if (forRole === 'driver') {
    switch (orderStatus) {
      case OrderStatus.PENDING:
        result = 'driverOrderAssigned';
        break;
      case OrderStatus.PLANNED:
        result = 'driverOrderAssigned';
        break;
      case OrderStatus.IN_PROGRESS:
        if (driverStatus === DriverAcceptanceStatus.ACCEPTED) result = 'driverOrderAccepted';
        else if (driverStatus === DriverAcceptanceStatus.ON_THE_WAY) result = 'driverOnTheWay';
        else if (driverStatus === DriverAcceptanceStatus.ARRIVED) result = 'driverArrived';
        else if (driverStatus === DriverAcceptanceStatus.PICKED_UP) result = 'driverPickedUp';
        else result = 'driverOrderAccepted';
        break;
      case OrderStatus.COMPLETED:
        result = 'driverOrderCompleted';
        break;
      case OrderStatus.CANCELLED:
        result = 'driverOrderCancelled';
        break;
      case OrderStatus.OVERDUE:
        result = 'systemOrderOverdue';
        break;
      default:
        result = 'driverOrderAssigned';
    }
  }
  // Для клиента
  else if (forRole === 'client') {
    switch (orderStatus) {
      case OrderStatus.PENDING:
        if (driverStatus === DriverAcceptanceStatus.PENDING || driverStatus === null)
          result = 'clientOrderCreated';
        else result = 'clientDriverAssigned';
        break;
      case OrderStatus.PLANNED:
        result = 'clientOrderPlanned';
        break;
      case OrderStatus.IN_PROGRESS:
        if (driverStatus === DriverAcceptanceStatus.ACCEPTED) result = 'clientDriverAccepted';
        else if (driverStatus === DriverAcceptanceStatus.ON_THE_WAY) result = 'clientDriverOnTheWay';
        else if (driverStatus === DriverAcceptanceStatus.ARRIVED) result = 'clientDriverArrived';
        else if (driverStatus === DriverAcceptanceStatus.PICKED_UP) result = 'clientDriverPickedUp';
        else result = 'clientDriverAssigned';
        break;
      case OrderStatus.COMPLETED:
        result = 'clientOrderCompleted';
        break;
      case OrderStatus.CANCELLED:
        result = 'clientOrderCancelled';
        break;
      case OrderStatus.OVERDUE:
        result = 'systemOrderOverdue';
        break;
      default:
        result = 'clientOrderCreated';
    }
  }
  // Для администратора
  else {
    switch (orderStatus) {
      case OrderStatus.PENDING:
        if (driverStatus === DriverAcceptanceStatus.PENDING || driverStatus === null)
          result = 'adminOrderCreated';
        else result = 'adminDriverAssigned';
        break;
      case OrderStatus.PLANNED:
        result = 'adminOrderPlanned';
        break;
      case OrderStatus.IN_PROGRESS:
        if (driverStatus === DriverAcceptanceStatus.ACCEPTED) result = 'adminDriverAccepted';
        else if (driverStatus === DriverAcceptanceStatus.ON_THE_WAY) result = 'adminDriverOnTheWay';
        else if (driverStatus === DriverAcceptanceStatus.ARRIVED) result = 'adminDriverArrived';
        else if (driverStatus === DriverAcceptanceStatus.PICKED_UP) result = 'adminDriverPickedUp';
        else result = 'adminDriverAssigned';
        break;
      case OrderStatus.COMPLETED:
        result = 'adminOrderCompleted';
        break;
      case OrderStatus.CANCELLED:
        result = 'adminOrderCancelled';
        break;
      case OrderStatus.OVERDUE:
        result = 'systemOrderOverdue';
        break;
      default:
        result = 'adminOrderCreated';
    }
  }

  console.log(`getNotificationTemplateKey - Результат для forRole=${forRole}, orderStatus=${orderStatus}, driverStatus=${driverStatus}:`, result);
  return result;
}
