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
  handleRefreshTokenExpiration,
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
  console.log('userSession', userSession);
  console.log('isAuthenticated', isAuthenticated);
  console.log('accessToken', accessToken);
  console.log('refreshToken', refreshToken);

  const isFirstRender = useRef(true);

  useEffect(() => {
    //Сначала устанавливаем токены в стор, если они переданы в пропсах.
    //Это необходимо, чтобы внутри refreshAccessTokenFx вызов $refreshToken.getState() вернул нужное значение.
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    //Если ни одного токена нет, сбрасываем стор
    if (!accessToken && !refreshToken) {
      resetAccessToken();
      resetRefreshToken();
    }

    //На первом рендере пытаемся обновить access-токен,
    //если присутствует refresh-токен, но access-токен отсутствует.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (refreshToken && !accessToken) {
        console.log('1 ШАГ: "Начинаем обновление токенов..."');
        refreshAccessTokenFx().then((result) => {
          if (result) {
            console.log('2 ШАГ: "Токены успешно обновлены!"');
            console.log('3 ШАГ: "Перезагружаем текущую страницу через 2.5 секунды"');
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log('2 ШАГ: "Ошибка при обновлении токенов!"');
            handleRefreshTokenExpiration();
          }
        });
      } else if (accessToken && !refreshToken) {
        console.warn(
          '[ПРЕДУПРЕЖДЕНИЕ] Обнаружен access-токен без refresh-токена. Выполняется logout.',
        );
        handleRefreshTokenExpiration();
      }
    }
  }, [accessToken, refreshToken]);

  return <SessionContext.Provider value={{ userSession }}>{children}</SessionContext.Provider>;
};
