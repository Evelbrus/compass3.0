import { createStore, createEvent, sample, createEffect } from 'effector';
import { parseJwt } from '@shared/utils/parse-jwt/parseJwt';

//Типы
type TokenType = 'access';

//Хранилища
export const $accessToken = createStore<string | null>(null);
export const $refreshToken = createStore<string | null>(null);

//События
export const setAccessToken = createEvent<string>();
export const resetAccessToken = createEvent();
export const setRefreshToken = createEvent<string>();
export const resetRefreshToken = createEvent();

//Таймеры (только для access токена)
const tokenTimers = new Map<TokenType, NodeJS.Timeout>();

//Утилиты для таймера access токена
const clearTokenTimer = (type: TokenType) => {
  const timer = tokenTimers.get(type);
  if (timer) {
    clearTimeout(timer);
  }
  tokenTimers.delete(type);
};

const scheduleTokenRefresh = (type: TokenType, expiresIn: number) => {
  clearTokenTimer(type);

  const bufferTime = 60000;
  const actualTime = expiresIn - bufferTime;

  const timer = setTimeout(() => {
    refreshAccessTokenFx();
  }, actualTime);

  tokenTimers.set(type, timer);
};

//Обработка истечения refresh-токена
export const handleRefreshTokenExpiration = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      console.error('[ОШИБКА] Не удалось выполнить logout');
    } else {
    }
  } catch (error) {
    console.error('[ОШИБКА] Ошибка при вызове logout:', error);
  }
  resetRefreshToken();
  resetAccessToken();
};

//Эффект обновления access-токена
export const refreshAccessTokenFx = createEffect<string | void, boolean, Error>(async (token) => {
  try {
    const refreshToken = token || $refreshToken.getState();

    if (!refreshToken) {
      console.error('[ОШИБКА] Refresh токен отсутствует');
      resetRefreshToken();
      return false;
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error(`[ОШИБКА] HTTP статус: ${response.status}`);
      throw new Error('Ошибка обновления токена');
    }

    const data = await response.json();
    console.log('[ОТВЕТ] Получены новые токены:', {
      accessToken: !!data.accessToken,
      refreshToken: !!data.refreshToken,
    });

    if (data.accessToken) {
      setAccessToken(data.accessToken);

      const decoded = parseJwt(data.accessToken);
      const expiresIn = decoded.exp * 1000 - Date.now();
    }

    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);

      const decoded = parseJwt(data.refreshToken);
      const expiresIn = decoded.exp * 1000 - Date.now();
    }
    return true;
  } catch (error) {
    console.error('[КРИТИЧЕСКАЯ ОШИБКА] Процедура обновления токенов:', error);
    return false;
  }
});

//Обработчики для токенов
const handleAccessToken = (token: string) => {
  const decoded = parseJwt(token);
  if (!decoded?.exp) {
    console.error('[ВНИМАНИЕ] Access токен не содержит даты экспирации');
    refreshAccessTokenFx();
    return;
  }

  const expiresIn = decoded.exp * 1000 - Date.now();

  if (expiresIn > 0) {
    scheduleTokenRefresh('access', expiresIn);
  } else {
    refreshAccessTokenFx();
  }
};

const handleRefreshToken = (token: string) => {
  const decoded = parseJwt(token);
  if (!decoded?.exp) {
    console.error('[ВНИМАНИЕ] Refresh токен не содержит даты экспирации');
    handleRefreshTokenExpiration();
    return;
  }

  const expiresIn = decoded.exp * 1000 - Date.now();

  if (expiresIn <= 0) {
    handleRefreshTokenExpiration();
  }
};

//Связка событий
$accessToken.on(setAccessToken, (_, token) => token).reset(resetAccessToken);

$refreshToken.on(setRefreshToken, (_, token) => token).reset(resetRefreshToken);

//Обработка side-эффектов
sample({
  source: setAccessToken,
  fn: (token) => handleAccessToken(token),
});

sample({
  source: setRefreshToken,
  fn: (token) => handleRefreshToken(token),
});

sample({
  clock: [resetAccessToken, resetRefreshToken],
  fn: () => {
    clearTokenTimer('access');
  },
});

//Геттеры
export const getAccessToken = () => $accessToken.getState();
export const getRefreshToken = () => $refreshToken.getState();
