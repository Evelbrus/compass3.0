import React from 'react';
import { RouteLiteral } from '@shared/utils/routing/private/rolePagesMap';
import { UserRole } from '@prisma/client';

export interface SidebarProps {
  lang: string;
  isAuthenticated: boolean;
  role: UserRole | undefined;
}

export interface NavItem {
  label: string;
  href: RouteLiteral;
  icon: React.ReactNode;
}
