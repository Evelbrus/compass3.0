import { NavItem } from '@shared/components/layout/sidebar';
import Icon from '@shared/components/ui/icon/Icon';
import { privateRoutes } from '@shared/utils/routing';

export const navItems: NavItem[] = [
  {
    label: 'Главная',
    href: privateRoutes.HOME,
    icon: (
      <Icon
        name="shopping-cart"
        alt="Главная"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Заказы',
    href: privateRoutes.ORDERS,
    icon: (
      <Icon
        name="shopping-cart"
        alt="Корзина"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Управления тарифами',
    href: privateRoutes.TARIFFMANAGEMENT,
    icon: (
      <Icon
        name="database"
        alt="Управление тарифами"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Управления автомобилями',
    href: privateRoutes.TRANSFERSERVICES,
    icon: (
      <Icon
        name="truck"
        alt="Управления автомобилями"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Водители',
    href: privateRoutes.DRIVERS,
    icon: (
      <Icon
        name="user"
        alt="Водители"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Клиенты',
    href: privateRoutes.USERS,
    icon: (
      <Icon
        name="users"
        alt="Клиенты"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Администратор',
    href: privateRoutes.ADMIN,
    icon: (
      <Icon
        name="users-settings"
        alt="Администратор"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Настройки',
    href: privateRoutes.SETTINGS,
    icon: (
      <Icon
        name="settings"
        alt="Настройки"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
  {
    label: 'Карта',
    href: privateRoutes.MAP,
    icon: (
      <Icon
        name="map"
        alt="Карта"
        className="w-6 h-6 text-current transition-colors duration-300"
      />
    ),
  },
];
