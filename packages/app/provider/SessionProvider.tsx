'use client';

import React, { useEffect } from 'react';
import { SessionContext } from '@shared/utils/contexts/SessionContext';
import { UserSession } from '@shared/prisma/interface/users/interface';
import {
  resetAccessToken,
  resetRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@shared/lib/effector/state/sessionStore';

interface SessionProviderProps {
  children: React.ReactNode;
  userSession: UserSession | null;
  isAuthenticated: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export const SessionProvider = ({
  children,
  userSession,
  isAuthenticated,
  accessToken,
  refreshToken,
}: SessionProviderProps) => {
  //Логирование при изменении токенов
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[АУТЕНТИФИКАЦИЯ] Пользователь аутентифицирован');
      if (accessToken) {
        console.log('[ACCESS TOKEN] Установка нового access токена');
        setAccessToken(accessToken);
      }
      if (refreshToken) {
        console.log('[REFRESH TOKEN] Установка нового refresh токена');
        setRefreshToken(refreshToken);
      }
    } else {
      console.log('[АУТЕНТИФИКАЦИЯ] Пользователь не аутентифицирован, сброс токенов');
      resetAccessToken();
      resetRefreshToken();
    }
  }, [isAuthenticated, accessToken, refreshToken]);

  return <SessionContext.Provider value={{ userSession }}>{children}</SessionContext.Provider>;
};
