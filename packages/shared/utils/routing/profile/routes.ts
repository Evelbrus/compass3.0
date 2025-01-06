export const profileMenuRoutes = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const;

export type ProfileMenuPageType = keyof typeof profileMenuRoutes;
