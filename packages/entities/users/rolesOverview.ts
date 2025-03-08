export interface StatusItem {
  key: string;
  label: string;
  description: string;
  color: string;
}

export const rolesOverview: StatusItem[] = [
  {
    key: 'all',
    label: 'Все пользователи',
    description: 'Пользователи, которые заказывают услуги.',
    color: 'bg-blue-500',
  },
  {
    key: 'Client',
    label: 'Клиент',
    description: 'Пользователи, которые заказывают услуги.',
    color: 'bg-blue-500',
  },
  {
    key: 'ClientCorp',
    label: 'Корпоративный Клиент',
    description: 'Корпоративные клиенты с расширенными возможностями.',
    color: 'bg-yellow-500',
  },
  {
    key: 'Driver',
    label: 'Водитель',
    description: 'Водители, выполняющие заказы.',
    color: 'bg-green-500',
  },
  {
    key: 'Operator',
    label: 'Оператор',
    description: 'Операторы, управляющие процессом заказов.',
    color: 'bg-purple-500',
  },
  {
    key: 'Admin',
    label: 'Администратор',
    description: 'Администраторы системы с полными правами.',
    color: 'bg-red-500',
  },
];
