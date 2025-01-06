export const publicRoutes = {
  LOGIN: '/login',
  REGISTER: '/orders',
} as const;

export type PublicPageType = keyof typeof publicRoutes;
