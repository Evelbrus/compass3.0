import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

export const orderStatusOptions = [
  { label: 'Ожидает подтверждения', value: OrderStatus.PENDING },
  { label: 'Запланирован', value: OrderStatus.PLANNED },
  { label: 'В процессе выполнения', value: OrderStatus.IN_PROGRESS },
  { label: 'Выполнен', value: OrderStatus.COMPLETED },
  { label: 'Отменен', value: OrderStatus.CANCELLED },
  { label: 'Просрочен', value: OrderStatus.OVERDUE },
];

export const orderStatusTranslations: Record<OrderStatus, string> = {
  PENDING: 'Ожидает подтверждения',
  PLANNED: 'Запланирован',
  IN_PROGRESS: 'В процессе выполнения',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменен',
  OVERDUE: 'Просрочен',
};

// Перевод статусов принятия заказа водителем
export const driverAcceptanceStatusOptions = [
  { label: 'Ожидание решения водителя', value: DriverAcceptanceStatus.PENDING },
  { label: 'Водитель уведомлен', value: DriverAcceptanceStatus.NOTIFIED },
  { label: 'Водитель принял заказ', value: DriverAcceptanceStatus.ACCEPTED },
  { label: 'Водитель в пути к клиенту', value: DriverAcceptanceStatus.ON_THE_WAY },
  { label: 'Водитель прибыл к клиенту', value: DriverAcceptanceStatus.ARRIVED },
  { label: 'Клиент в машине, поездка начата', value: DriverAcceptanceStatus.PICKED_UP },
  { label: 'Время для принятия заказа истекло', value: DriverAcceptanceStatus.TIMEOUT },
  { label: 'Поездка завершена', value: DriverAcceptanceStatus.COMPLETED },
  { label: 'Водитель отклонил заказ', value: DriverAcceptanceStatus.REJECTED },
  { label: 'Заказ отменен', value: DriverAcceptanceStatus.CANCELLED },
];

// Справочники для получения перевода по значению enum
export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'В ожидании',
  [OrderStatus.PLANNED]: 'Запланирован',
  [OrderStatus.IN_PROGRESS]: 'Выполняется',
  [OrderStatus.COMPLETED]: 'Завершен',
  [OrderStatus.CANCELLED]: 'Отменен',
  [OrderStatus.OVERDUE]: 'Просрочен',
};

export const driverAcceptanceStatusLabels: Record<DriverAcceptanceStatus, string> = {
  [DriverAcceptanceStatus.PENDING]: 'Ожидание решения водителя',
  [DriverAcceptanceStatus.NOTIFIED]: 'Водитель уведомлен',
  [DriverAcceptanceStatus.ACCEPTED]: 'Водитель принял заказ',
  [DriverAcceptanceStatus.ON_THE_WAY]: 'Водитель в пути к клиенту',
  [DriverAcceptanceStatus.ARRIVED]: 'Водитель прибыл к клиенту',
  [DriverAcceptanceStatus.PICKED_UP]: 'Клиент в машине, поездка начата',
  [DriverAcceptanceStatus.TIMEOUT]: 'Время для принятия заказа истекло',
  [DriverAcceptanceStatus.COMPLETED]: 'Поездка завершена',
  [DriverAcceptanceStatus.REJECTED]: 'Водитель отклонил заказ',
  [DriverAcceptanceStatus.CANCELLED]: 'Заказ отменен',
};

// Вспомогательная функция для получения человекочитаемого статуса заказа
export const getOrderStatusLabel = (status: OrderStatus | null | undefined): string => {
  if (!status) return 'Неизвестно';
  return orderStatusLabels[status] || 'Неизвестно';
};
