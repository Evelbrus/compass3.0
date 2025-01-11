import React from 'react';
import { UserRole } from '@prisma/client';
import { privateRoutes } from '@shared/utils/routing';

type PrivateRoutePath = (typeof privateRoutes)[keyof typeof privateRoutes];
export type RoutePath = PrivateRoutePath;

export interface SidebarProps {
  role: UserRole | undefined;
}

export interface NavItem {
  label: string;
  href: RoutePath;
  icon: React.ReactNode;
}
