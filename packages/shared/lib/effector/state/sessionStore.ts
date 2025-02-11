import { createStore, createEvent, sample, createEffect } from 'effector';
import { parseJwt } from '@shared/utils/parse-jwt/parseJwt';

//====================
//Типы и хранилища
//====================

type TokenType = 'access';

export const $accessToken = createStore<string | null>(null);
export const $refreshToken = createStore<string | null>(null);

export const setAccessToken = createEvent<string>();
export const resetAccessToken = createEvent();
export const setRefreshToken = createEvent<string>();
export const resetRefreshToken = createEvent();

//====================
//Таймеры для access-токена
//====================

const tokenTimers = new Map<TokenType, NodeJS.Timeout>();

const clearTokenTimer = (type: TokenType) => {
  const timer = tokenTimers.get(type);
  if (timer) {
    clearTimeout(timer);
  }
  tokenTimers.delete(type);
};

const scheduleTokenRefresh = (type: TokenType, expiresIn: number) => {
  clearTokenTimer(type);
  const bufferTime = 60000; //буфер 1 минута
  let actualTime = expiresIn - bufferTime;
  if (actualTime < 1000) actualTime = 1000;

  console.log(`[SCHEDULE] Обновление ${type}-токена через ${actualTime} мс`);

  const timer = setTimeout(() => {
    refreshToken();
  }, actualTime);

  tokenTimers.set(type, timer);
};

//====================
//Обработка истечения refresh-токена
//====================

export const handleRefreshTokenExpiration = async () => {
  console.warn('[SESSION] Refresh токен истек, выполняем logout');
  await fetch('/api/auth/logout', { method: 'POST' });
  resetRefreshToken();
  resetAccessToken();
};

//====================
//Синхронизация между вкладками
//====================

let isRefreshing = false;
const tokenChannel = new BroadcastChannel('token_channel');

tokenChannel.onmessage = (event) => {
  const { type, tokens } = event.data;
  if (type === 'TOKEN_REFRESH_START') {
    isRefreshing = true;
  } else if (type === 'TOKEN_REFRESH_COMPLETE') {
    isRefreshing = false;
    if (tokens) {
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
    }
  }
};

//====================
//Эффект обновления access-токена
//====================

export const refreshAccessTokenFx = createEffect(async () => {
  try {
    const refreshTokenValue = $refreshToken.getState();
    if (!refreshTokenValue) {
      console.error('[ERROR] Refresh токен отсутствует');
      resetRefreshToken();
      return false;
    }

    //Логируем перед запросом для отладки
    console.log('refreshAccessTokenFx: refreshTokenValue =', refreshTokenValue);

    const loginAttemptId = getLoginAttemptId();
    console.log('refreshAccessTokenFx: loginAttemptId =', loginAttemptId);

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenValue, loginAttemptId }),
    });

    if (!response.ok) {
      console.error(`[ERROR] HTTP статус: ${response.status}`);
      throw new Error('Ошибка обновления токена');
    }

    const data = await response.json();

    if (data.accessToken) {
      setAccessToken(data.accessToken);
      const decoded = parseJwt(data.accessToken);
      scheduleTokenRefresh('access', decoded.exp * 1000 - Date.now());
    }

    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    return true;
  } catch (error) {
    console.error('Ошибка в refreshAccessTokenFx:', error);
    return false;
  }
});

//====================
//Обработчики токенов
//====================

const handleAccessToken = (token: string) => {
  try {
    const decoded = parseJwt(token);
    if (!decoded?.exp) {
      console.warn('[ACCESS] Нет exp в токене, обновляем');
      refreshAccessTokenFx();
      return;
    }
    scheduleTokenRefresh('access', decoded.exp * 1000 - Date.now());
  } catch (err) {
    console.error('Ошибка обработки access-токена:', err);
    refreshAccessTokenFx();
  }
};

const handleRefreshToken = (token: string) => {
  try {
    const decoded = parseJwt(token);
    if (!decoded?.exp || decoded.exp * 1000 - Date.now() <= 0) {
      console.warn('[REFRESH] Refresh-токен истек');
      handleRefreshTokenExpiration();
    }
  } catch (err) {
    console.error('Ошибка обработки refresh-токена:', err);
    handleRefreshTokenExpiration();
  }
};

$accessToken.on(setAccessToken, (_, token) => token).reset(resetAccessToken);
$refreshToken.on(setRefreshToken, (_, token) => token).reset(resetRefreshToken);

sample({
  source: setAccessToken,
  fn: handleAccessToken,
});

sample({
  source: setRefreshToken,
  fn: handleRefreshToken,
});

sample({
  clock: [resetAccessToken, resetRefreshToken],
  fn: () => clearTokenTimer('access'),
});

//====================
//Вспомогательные функции
//====================

export const getAccessToken = () => $accessToken.getState();
export const getRefreshToken = () => $refreshToken.getState();

function getLoginAttemptId(): string {
  const refreshTokenValue = $refreshToken.getState();
  if (!refreshTokenValue) throw new Error('Отсутствует refresh токен');

  const decoded = parseJwt(refreshTokenValue);
  if (!decoded.loginAttemptId) throw new Error('loginAttemptId отсутствует');
  return decoded.loginAttemptId;
}

//====================
//Функция обновления токена (для планового обновления)
//====================

export async function refreshToken() {
  if (isRefreshing) return;
  isRefreshing = true;
  tokenChannel.postMessage({ type: 'TOKEN_REFRESH_START' });
  try {
    const success = await refreshAccessTokenFx();
    if (success) {
      tokenChannel.postMessage({
        type: 'TOKEN_REFRESH_COMPLETE',
        tokens: { accessToken: getAccessToken(), refreshToken: getRefreshToken() },
      });
    }
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
  } finally {
    isRefreshing = false;
  }
}
