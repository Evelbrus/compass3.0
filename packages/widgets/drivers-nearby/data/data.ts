import { Drivers } from '@shared/lib/effector/drivers';

export const mockDrivers: Drivers[] = [
  {
    id: 1, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Иванов',
    phone: '996 700 53 53 53',
    active: true,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 17, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Круглый',
    phone: '996 700 53 53 53',
    active: true,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 2, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Карасёв',
    phone: '996 700 53 53 53',
    active: false,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 3, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Великий',
    phone: '996 700 53 53 53',
    active: true,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 4, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Дубощин',
    phone: '996 700 53 53 53',
    active: true,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 5, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Грозный',
    phone: '996 700 53 53 53',
    active: true,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 6, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Керосин',
    phone: '996 700 53 53 53',
    active: false,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 7, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Литвин',
    phone: '996 700 53 53 53',
    active: true,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 8, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Иван',
    lastName: 'Рофлян',
    phone: '996 700 53 53 53',
    active: true,
    tariff: [{ value: 'vip', label: 'VIP', maxPeople: 5, price: 1000 }],
  },
  {
    id: 9, // Уникальный идентификатор
    image: 'https://via.placeholder.com/150',
    firstName: 'Петр',
    lastName: 'Петров',
    phone: '996 700 53 53 53',
    active: false,
    tariff: [{ value: 'economy', label: 'Эконом', maxPeople: 10, price: 500 }],
  },
  // Добавьте больше моковых драйверов по необходимости
];
