import { StatusItem } from '@widgets/status-overview';

export const ordersClientCorpOverview: StatusItem[] = [
  {
    key: 'PENDING',
    label: 'В ожидании',
    description: 'Заказы, которые ожидают выполнения.',
    color: 'bg-yellow-500',
  },
  {
    key: 'PLANNED',
    label: 'Запланировано',
    description: 'Заказы, которые запланированы к выполнению.',
    color: 'bg-purple-500',
  },
  {
    key: 'IN_PROGRESS',
    label: 'В процессе',
    description: 'Заказы, которые находятся в процессе выполнения.',
    color: 'bg-blue-500',
  },
  {
    key: 'COMPLETED',
    label: 'Завершен',
    description: 'Заказы, которые были успешно завершены.',
    color: 'bg-green-500',
  },
  {
    key: 'CANCELLED',
    label: 'Отменен',
    description: 'Заказы, которые были отменены.',
    color: 'bg-red-500',
  },
  {
    key: 'OVERDUE',
    label: 'Просрочен',
    description: 'Заказы, которые были просрочены.',
    color: 'bg-orange-500',
  },
];
