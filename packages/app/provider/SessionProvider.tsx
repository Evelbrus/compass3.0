'use client';

import React, { useEffect, useRef } from 'react';
import { SessionContext } from '@shared/utils/contexts/SessionContext';
import { UserSession } from '@shared/prisma/interface/users/interface';
import {
  resetAccessToken,
  resetRefreshToken,
  setAccessToken,
  setRefreshToken,
  refreshAccessTokenFx,
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
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      //Проверяем, есть ли refreshToken и нет ли accessToken при первом рендере
      if (refreshToken && !accessToken) {
        console.log('1 ШАГ: "Начинаем обновление токенов..."');
        refreshAccessTokenFx(refreshToken)
          .then(() => {
            console.log('2 ШАГ: "Токены успешно обновлены!"');

            //Перезагружаем страницу с задержкой
            console.log('3 ШАГ: "Перезагружаем текущую страницу через 2.5 секунды"');
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          })
          .catch(() => {
            console.log('2 ШАГ: "Ошибка при обновлении токенов!"');
          });
      }
    }

    //Обновление токенов при изменении auth state
    if (isAuthenticated) {
      if (accessToken) {
        setAccessToken(accessToken);
      }
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
    } else {
      resetAccessToken();
      resetRefreshToken();
    }
  }, [refreshToken, accessToken, isAuthenticated]);

  return <SessionContext.Provider value={{ userSession }}>{children}</SessionContext.Provider>;
};
