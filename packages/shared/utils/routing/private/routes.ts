export const privateRoutes = {
  HOME: '/',
  ORDERS: '/orders',
  ORDERCREATE: '/order/create',
  ORDEREDIT: '/order/edit',

  TARIFFMANAGEMENT: '/tariff-management',
  TARIFFCREATEMANAGEMENT: '/tariff-management/create',
  TRANSFERSERVICES: '/transfer-services',
  TRANSFERSERVICESCREATE: '/transfer-services/create',

  USERS: '/users',
  DRIVERS: '/drivers',

  ORDERSEDIT: '/orders/edit',

  USERCLIENTDETAIL: '/user/client/detail',
  USERCLIENTCREATE: '/user/create/client',
  USERCLIENTEDIT: '/user/client/edit',

  USERCLIENTCORPDETAIL: '/user/client-corp/detail',
  USERCLIENTCORPCREATE: '/user/create/client-corp',
  USERCLIENTCORPEDIT: '/user/client-corp/edit',

  USERDRIVERDETAIL: '/user/driver/detail',
  USERDRIVERCREATE: '/user/create/driver',
  USERDRIVEREDIT: '/user/driver/edit',

  USEROPERATORDETAIL: '/user/operator/detail',
  USEROPERATORCREATE: '/user/create/operator',
  USEROPERATOREDIT: '/user/operator/edit',

  USERADMINDETAIL: '/user/admin/detail',
  USERADMINCREATE: '/user/create/admin',
  USERADMINEDIT: '/user/admin/edit',

  ADMIN: '/admin',
  SETTINGS: '/settings',
  MAP: '/map',
  REFERENCEBOOK: '/reference-book',
} as const;

export type PrivatePageType = keyof typeof privateRoutes;
