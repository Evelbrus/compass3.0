import { OrderStatus } from '@prisma/client';

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

export type OrderStatusTranslationsType = typeof orderStatusTranslations;
