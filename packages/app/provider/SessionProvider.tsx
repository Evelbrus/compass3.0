'use client';

import React, { useEffect, useRef } from 'react';
import { SessionContext } from '@shared/utils/contexts/SessionContext';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { parseJwt } from '@shared/utils/parse-jwt/parseJwt';
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
  accessToken?: string | null;
  refreshToken?: string | null;
}

export const SessionProvider = ({
  children,
  userSession,
  accessToken,
  refreshToken,
}: SessionProviderProps) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    //Устанавливаем токены в стор, если они переданы в пропсах
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

    if (isFirstRender.current) {
      isFirstRender.current = false;

      //Если есть refreshToken, но нет accessToken – пробуем обновить токены
      if (refreshToken && !accessToken) {
        //Добавляем проверку валидности refresh‑токена перед обновлением
        try {
          const decodedRefresh = parseJwt(refreshToken);
          if (!decodedRefresh?.exp || decodedRefresh.exp * 1000 - Date.now() <= 0) {
            console.warn('[REFRESH] Refresh‑токен истёк');
            handleRefreshTokenExpiration();
            return;
          }
        } catch (error) {
          console.error('Ошибка парсинга refresh‑токена:', error);
          handleRefreshTokenExpiration();
          return;
        }

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
          '[ПРЕДУПРЕЖДЕНИЕ] Обнаружен access‑токен без refresh‑токена. Выполняется logout.',
        );
        handleRefreshTokenExpiration();
      }
    }
  }, [accessToken, refreshToken]);

  return <SessionContext.Provider value={{ userSession }}>{children}</SessionContext.Provider>;
};
