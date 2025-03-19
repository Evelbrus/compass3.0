'use client';

import React from 'react';
import { SessionContext } from '@shared/utils/contexts/SessionContext';
import { UserSession } from '@shared/prisma/interface/users/interface';

interface SessionProviderProps {
  children: React.ReactNode;
  userSession: UserSession | null;
}

export const SessionProvider = ({ children, userSession }: SessionProviderProps) => {
  return <SessionContext.Provider value={{ userSession }}>{children}</SessionContext.Provider>;
};
