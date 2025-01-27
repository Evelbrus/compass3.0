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
    console.log(`[ТАЙМЕР] Очистка таймера для ${type} токена`);
    clearTimeout(timer);
  }
  tokenTimers.delete(type);
};

const scheduleTokenRefresh = (type: TokenType, expiresIn: number) => {
  clearTokenTimer(type);

  const bufferTime = 60000;
  const actualTime = expiresIn - bufferTime;

  console.log(`[ТАЙМЕР] Установка таймера для ${type} токена:`);
  console.log(
    `[ТАЙМЕР] Обновление через: ${Math.floor(actualTime / 60000)} мин. ${Math.floor((actualTime % 60000) / 1000)} сек.`,
  );

  const timer = setTimeout(() => {
    console.log(`[ТАЙМЕР] Сработало автоматическое обновление для ${type} токена`);
    refreshAccessTokenFx();
  }, actualTime);

  tokenTimers.set(type, timer);
};

//Обработка истечения refresh-токена
const handleRefreshTokenExpiration = async () => {
  console.log('[ИСТЕЧЕНИЕ] Refresh токен устарел, выполняется полный сброс');
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      console.error('[ОШИБКА] Не удалось выполнить logout');
    } else {
      console.log('[LOGOUT] Пользователь успешно вышел из системы');
    }
  } catch (error) {
    console.error('[ОШИБКА] Ошибка при вызове logout:', error);
  }
  resetRefreshToken();
  resetAccessToken();
  //window.location.href = '/login';
};

//Эффект обновления access-токена
export const refreshAccessTokenFx = createEffect<void, boolean, Error>(async () => {
  console.log('[ОБНОВЛЕНИЕ] Запуск процедуры обновления токенов...');
  try {
    const refreshToken = $refreshToken.getState();

    if (!refreshToken) {
      console.error('[ОШИБКА] Refresh токен отсутствует');
      resetRefreshToken();
      return false;
    }

    console.log('[ЗАПРОС] Отправка запроса на /api/auth/refresh');
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
      console.log('[ОБНОВЛЕНИЕ] Устанавливаем новый access токен');
      setAccessToken(data.accessToken);

      const decoded = parseJwt(data.accessToken);
      const expiresIn = decoded.exp * 1000 - Date.now();
      console.log(`[СРОК] Access токен действителен: ${Math.floor(expiresIn / 60000)} мин.`);
    }

    if (data.refreshToken) {
      console.log('[ОБНОВЛЕНИЕ] Устанавливаем новый refresh токен');
      setRefreshToken(data.refreshToken);

      const decoded = parseJwt(data.refreshToken);
      const expiresIn = decoded.exp * 1000 - Date.now();
      console.log(`[СРОК] Refresh токен действителен: ${Math.floor(expiresIn / 60000)} мин.`);
    }

    console.log('[ОБНОВЛЕНИЕ] Токены успешно обновлены!');
    return true;
  } catch (error) {
    console.error('[КРИТИЧЕСКАЯ ОШИБКА] Процедура обновления токенов:', error);
    handleRefreshTokenExpiration();
    return false;
  }
});

//Обработчики для токенов
const handleAccessToken = (token: string) => {
  console.log('[УСТАНОВКА] Новый access токен получен');
  const decoded = parseJwt(token);
  if (!decoded?.exp) {
    console.error('[ВНИМАНИЕ] Access токен не содержит даты экспирации');
    refreshAccessTokenFx();
    return;
  }

  const expiresIn = decoded.exp * 1000 - Date.now();
  console.log(
    `[СРОК] Access токен будет автоматически обновлен через: ${Math.floor(expiresIn / 60000)} мин.`,
  );

  if (expiresIn > 0) {
    scheduleTokenRefresh('access', expiresIn);
  } else {
    console.log('[СРОК] Access токен уже устарел, немедленное обновление');
    refreshAccessTokenFx();
  }
};

const handleRefreshToken = (token: string) => {
  console.log('[УСТАНОВКА] Новый refresh токен получен');
  const decoded = parseJwt(token);
  if (!decoded?.exp) {
    console.error('[ВНИМАНИЕ] Refresh токен не содержит даты экспирации');
    handleRefreshTokenExpiration();
    return;
  }

  const expiresIn = decoded.exp * 1000 - Date.now();
  console.log(`[СРОК] Refresh токен действителен: ${Math.floor(expiresIn / 60000)} мин.`);

  if (expiresIn <= 0) {
    console.log('[СРОК] Refresh токен уже устарел, выполняется сброс');
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
