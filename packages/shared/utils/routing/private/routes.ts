// @/shared/utils/routing/private/routes.ts

export const privateRoutes = {
  HOME: '/',
  ORDERS: '/orders',
  ORDERCREATE: '/order/create',
  ORDEREDIT: '/order/edit/:id',

  TARIFFMANAGEMENT: '/tariff-management',
  TARIFFCREATEMANAGEMENT: '/tariff-management/create',
  TARIFFEDITMANAGEMENT: '/tariff-management/edit/:id',

  TRANSFERSERVICES: '/transfer-services',
  TRANSFERSERVICESDETAIL: '/transfer-services/detail/:id',
  TRANSFERSERVICESCREATE: '/transfer-services/create',
  TRANSFERSERVICESEDIT: '/transfer-services/edit/:id',

  USERS: '/users',
  USERSDETAIL: '/user/detail/:id',
  USERSCREATE: '/user/create/:role',
  USERSEDIT: '/user/edit/:id',
  DRIVERS: '/drivers',

  ADMIN: '/admin',
  SETTINGS: '/settings',
  MAP: '/map',
  REFERENCEBOOK: '/reference-book',
  REFERENCEBOOKADDITIONALSERVICES: '/reference-book/additional-services',
  REFERENCEBOOKPOINTS: '/reference-book/points',
} as const;

export type PrivatePageType = keyof typeof privateRoutes;

export interface BreadcrumbItem {
  path: string;
  title: string;
  description?: string;
}

export const breadcrumbsMap: Partial<Record<string, BreadcrumbItem[]>> = {
  '/': [{ path: '/', title: 'Главная', description: 'Главная страница приложения' }],

  '/orders': [{ path: '/orders', title: 'Список заказов', description: 'Список всех заказов' }],
  '/order/create': [
    { path: '/orders', title: 'Заказы' },
    {
      path: '/order/create',
      title: 'Создание нового заказа',
      description: 'Заполните информацию о маршруте, выберите услуги и водителя',
    },
  ],
  '/order/edit/:id': [
    { path: '/orders', title: 'Заказы' },
    {
      path: '/order/edit/:id',
      title: 'Редактирование заказа',
      description: 'Заполните информацию о маршруте, выберите услуги и водителя',
    },
  ],

  '/tariff-management': [
    {
      path: '/tariff-management',
      title: 'Управление тарифами',
      description: 'Список тарифов',
    },
  ],
  '/tariff-management/create': [
    {
      path: '/tariff-management',
      title: 'Управление тарифами',
    },
    {
      path: '/tariff-management/create',
      title: 'Создание нового тарифа',
      description: 'Заполните информацию для создания тарифа',
    },
  ],
  '/tariff-management/edit/:id': [
    {
      path: '/tariff-management',
      title: 'Управление тарифами',
    },
    {
      path: '/tariff-management/edit/:id',
      title: 'Редактирование тарифа',
      description: 'Заполните информацию для обновления тарифа',
    },
  ],

  '/transfer-services': [
    {
      path: '/transfer-services',
      title: 'Список транспортного средства',
    },
  ],
  '/transfer-services/detail/:id': [
    {
      path: '/transfer-services',
      title: 'Список транспортного средства',
    },
    {
      path: '/transfer-services/create/:id',
      title: 'Детальный просмотр транспортного средства',
      description: 'Информация о транспортном средстве',
    },
  ],
  '/transfer-services/create': [
    {
      path: '/transfer-services',
      title: 'Список транспортного средства',
    },
    {
      path: '/transfer-services/create',
      title: 'Создание транспортного средства',
      description: 'Заполните информацию для создания записи автомобиля',
    },
  ],
  '/transfer-services/edit/:id': [
    {
      path: '/transfer-services',
      title: 'Список транспортного средства',
    },
    {
      path: '/transfer-services/edit/:id',
      title: 'Редактирование транспортного средства',
      description: 'Заполните информацию для обновления записи автомобиля',
    },
  ],

  '/users': [
    {
      path: '/users',
      title: 'Список пользователей',
    },
  ],
  '/drivers': [
    {
      path: '/drivers',
      title: 'Список водителей',
    },
  ],
  '/user/detail/:id': [
    { path: '/users', title: 'Список пользователей' },
    {
      path: '/user/detail/:id',
      title: 'Детальный просмотр',
      description: 'Подробная информация о пользователе',
    },
  ],
  '/user/create/:role': [
    { path: '/users', title: 'Пользователи' },
    {
      path: '/user/create/:role',
      title: 'Создание пользователя',
      description: 'Создание нового пользователя с указанной ролью',
    },
  ],
  '/user/edit/:id': [
    { path: '/users', title: 'Пользователи' },
    {
      path: '/user/edit/:id',
      title: 'Редактирование пользователя',
      description: 'Редактирование пользователя',
    },
  ],
  '/settings': [
    {
      path: '/settings',
      title: 'Настройки',
      description: 'Настройки приложения',
    },
  ],
  '/map': [
    {
      path: '/map',
      title: 'Карта',
      description: 'Интерактивная карта',
    },
  ],
  '/reference-book': [
    {
      path: '/reference-book',
      title: 'Справочник',
      description: 'Справочные материалы',
    },
  ],
  // Добавляем новые маршруты в breadcrumbsMap
  '/reference-book/additional-services': [
    {
      path: '/reference-book',
      title: 'Справочник',
    },
    {
      path: '/reference-book/additional-services',
      title: 'Дополнительные услуги',
      description: 'Список дополнительных услуг',
    },
  ],
  '/reference-book/points': [
    {
      path: '/reference-book',
      title: 'Справочник',
    },
    {
      path: '/reference-book/points',
      title: 'Адреса',
      description: 'Список адресов маршрута',
    },
  ],
};
