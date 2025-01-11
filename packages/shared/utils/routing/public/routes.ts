export const publicRoutes = {
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

export type PublicPageType = keyof typeof publicRoutes;
