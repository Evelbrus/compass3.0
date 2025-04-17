// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';

// Типизация payload для refresh токена
interface RefreshTokenPayload {
  uuid: string;
  sessionId: string;
  refreshToken: string;
}

// Публичные маршруты, которые не требуют проверки авторизации
const publicPaths = ['/login', '/register', '/_next', '/static', '/favicon.ico'];

// Публичные API маршруты
const publicApiPaths = [
  '/api/auth',
  '/api/shared/public',
  // Добавьте другие публичные API пути (но не '/api' целиком!)
];

// Проверка, является ли маршрут API для обновления токенов
const isRefreshPath = (path: string) =>
  path.startsWith('/api/auth/refresh-return') || path.startsWith('/api/auth/refresh');

// Проверка, является ли маршрут публичным API
const isPublicApiPath = (path: string) =>
  publicApiPaths.some((apiPath) => path === apiPath || path.startsWith(apiPath + '/'));

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isApiRequest = path.startsWith('/api/');
  
  console.log('[MIDDLEWARE] Обработка запроса:', {
    path,
    method: request.method,
    fullUrl: request.url,
    hasAccessToken: !!request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
    hasRefreshToken: !!request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  });
  
  // ВАЖНО: полностью исключаем API обновления токенов из middleware
  if (isRefreshPath(path)) {
    console.log('[MIDDLEWARE] Полное исключение API обновления токенов из middleware');
    return NextResponse.next();
  }
  
  // Проверяем, является ли путь публичным (не API)
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath + '/'),
  );
  
  if (isPublicPath || isPublicApiPath(path)) {
    console.log('[MIDDLEWARE] Обнаружен публичный маршрут');
    
    // Для страницы логина нужна специальная обработка
    if (path === '/login') {
      console.log('[MIDDLEWARE] Обработка логин-страницы');
      const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
      const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
      
      // Если есть токены, проверяем их валидность
      if (refreshToken) {
        console.log('[MIDDLEWARE] Найден refresh токен на странице логина');
        try {
          // Проверяем refresh токен
          console.log('[MIDDLEWARE] Проверка refresh токена...');
          await verifyJWT<RefreshTokenPayload>(refreshToken, authConfig.refreshToken.secret);
          console.log('[MIDDLEWARE] Refresh токен валиден');
          
          // Проверяем accessToken
          if (accessToken) {
            console.log('[MIDDLEWARE] Проверка access токена...');
            try {
              await verifyJWT(accessToken, authConfig.accessToken.secret);
              console.log('[MIDDLEWARE] Access токен валиден, перенаправляем на главную');
              // Оба токена валидны, перенаправляем на главную
              return NextResponse.redirect(new URL('/', request.url));
            } catch (error) {
              console.log('[MIDDLEWARE] Access токен невалиден, но refresh валиден');
              // Access токен невалиден, но refresh валиден - перенаправляем на API для обновления
              const returnUrl = encodeURIComponent('/');
              const baseUrl = new URL('/', request.url).origin;
              const refreshReturnUrl = `${baseUrl}/api/auth/refresh-return?returnUrl=${returnUrl}&token=${refreshToken}`;
              console.log('[MIDDLEWARE] Перенаправление на:', refreshReturnUrl);
              return NextResponse.redirect(refreshReturnUrl);
            }
          }
          
          console.log('[MIDDLEWARE] Access токен отсутствует, но refresh валиден');
          // Если нет access токена, но есть валидный refresh - перенаправляем на API для обновления
          const returnUrl = encodeURIComponent('/');
          const baseUrl = new URL('/', request.url).origin;
          const refreshReturnUrl = `${baseUrl}/api/auth/refresh-return?returnUrl=${returnUrl}&token=${refreshToken}`;
          console.log('[MIDDLEWARE] Перенаправление на:', refreshReturnUrl);
          return NextResponse.redirect(refreshReturnUrl);
        } catch (error) {
          console.error('[MIDDLEWARE] Ошибка валидации refresh токена:', error);
          // Refresh токен невалиден, удаляем оба токена
          const response = NextResponse.next();
          response.cookies.delete(ACCESS_TOKEN_COOKIE);
          response.cookies.delete(REFRESH_TOKEN_COOKIE);
          return response;
        }
      }
      
      console.log('[MIDDLEWARE] Токены отсутствуют, показываем страницу логина');
      // Нет токенов, просто отображаем страницу логина
      return NextResponse.next();
    }

    console.log('[MIDDLEWARE] Пропускаем другой публичный маршрут');
    // Для других публичных маршрутов
    return NextResponse.next();
  }

  console.log('[MIDDLEWARE] Защищенный маршрут, проверяем авторизацию');

  // Получаем токены из cookies
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Если нет refresh токена
  if (!refreshToken) {
    console.log('[MIDDLEWARE] Refresh токен отсутствует');

    if (isApiRequest) {
      // Для API запросов возвращаем специальный статус код и URL для редиректа
      console.log(
        '[MIDDLEWARE] API запрос без refresh токена, сигнализируем о необходимости редиректа',
      );

      // Возвращаем JSON с информацией о том, куда должен перейти клиент
      const loginUrl = new URL('/login', request.url).toString();
      const response = NextResponse.json(
        {
          message: 'Unauthorized',
          code: 'AUTH_ERROR',
          redirectTo: loginUrl,
        },
        {
          status: 401,
          headers: {
            'X-Redirect-To': loginUrl, // Добавляем специальный заголовок для клиентского кода
          },
        },
      );

      // Удаляем все токены из cookies
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);

      return response;
    } else {
      // Для обычных запросов делаем полный редирект на страницу логина
      console.log('[MIDDLEWARE] Перенаправляем на логин с полной перезагрузкой');
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl, 302); // 302 Found - временный редирект

      // Удаляем все токены из cookies
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);

      return response;
    }
  }

  // Если есть access токен, проверяем его валидность
  if (accessToken) {
    console.log('[MIDDLEWARE] Проверка access токена...');
    try {
      await verifyJWT(accessToken, authConfig.accessToken.secret);
      console.log('[MIDDLEWARE] Access токен валиден, пропускаем запрос');
      // Токен валиден, пропускаем запрос
      return NextResponse.next();
    } catch (error) {
      console.log('[MIDDLEWARE] Access токен невалиден, пробуем использовать refresh');
      // Access токен невалиден, но есть refresh токен
      try {
        // Проверяем только валидность refresh токена
        console.log('[MIDDLEWARE] Проверка refresh токена...');
        await verifyJWT<RefreshTokenPayload>(refreshToken, authConfig.refreshToken.secret);
        console.log('[MIDDLEWARE] Refresh токен валиден');

        // Разная логика для API и обычных запросов
        if (isApiRequest) {
          console.log('[MIDDLEWARE] API запрос, выполняем прямое обновление токенов');

          try {
            // Вызываем API обновления токенов напрямую
            const baseUrl = new URL('/', request.url).origin;
            const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) {
              console.error('[MIDDLEWARE] Ошибка обновления токенов:', refreshResponse.status);
              // Если не удалось обновить токены, пропускаем запрос дальше,
              // он завершится ошибкой 401 в API-контроллере
              const response = NextResponse.next();
              return response;
            }

            // Получаем новые токены
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.accessToken;
            const newRefreshToken = refreshData.refreshToken;

            console.log('[MIDDLEWARE] Токены успешно обновлены');

            // Создаем новые заголовки для запроса с новым токеном
            const newHeaders = new Headers(request.headers);
            newHeaders.set('Authorization', `Bearer ${newAccessToken}`);

            // Важно: создаем новый запрос с тем же методом и телом, но с новым заголовком
            const response = NextResponse.next({
              request: {
                headers: newHeaders,
              },
            });

            // Устанавливаем cookies с новыми токенами
            const cookieOptions = {
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict' as const,
            };

            response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
              ...cookieOptions,
              maxAge: authConfig.accessToken.maxAge,
            });

            response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
              ...cookieOptions,
              maxAge: authConfig.refreshToken.maxAge,
            });

            // После успешного обновления токенов, продолжаем запрос
            console.log(
              '[MIDDLEWARE] Токены успешно обновлены, продолжаем запрос с новыми токенами и заголовком Authorization',
            );
            return response;
          } catch (error) {
            console.error('[MIDDLEWARE] Ошибка при обновлении токенов:', error);
            // В случае ошибки пропускаем запрос дальше
            // он завершится ошибкой 401 в API-контроллере
            const response = NextResponse.next();
            return response;
          }
        } else {
          // Для не-API запросов используем редирект
          const returnUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
          const baseUrl = new URL('/', request.url).origin;
          const refreshReturnUrl = `${baseUrl}/api/auth/refresh-return?returnUrl=${returnUrl}&token=${refreshToken}`;
          console.log('[MIDDLEWARE] Перенаправление на API обновления:', refreshReturnUrl);
          return NextResponse.redirect(refreshReturnUrl);
        }
      } catch (refreshError) {
        console.error('[MIDDLEWARE] Ошибка проверки refresh токена:', refreshError);

        if (isApiRequest) {
          // Для API запросов просто пропускаем с 401
          console.log('[MIDDLEWARE] API запрос с невалидным refresh токеном, пропускаем с 401');
          const response = NextResponse.next();
          response.cookies.delete(ACCESS_TOKEN_COOKIE);
          response.cookies.delete(REFRESH_TOKEN_COOKIE);
          return response;
        } else {
          // Для не-API запросов перенаправляем на логин
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete(ACCESS_TOKEN_COOKIE);
          response.cookies.delete(REFRESH_TOKEN_COOKIE);
          return response;
        }
      }
    }
  } else if (refreshToken) {
    console.log('[MIDDLEWARE] Access токен отсутствует, но есть refresh токен');
    // Если нет access токена, но есть refresh токен
    try {
      // Проверяем валидность refresh токена
      console.log('[MIDDLEWARE] Проверка refresh токена...');
      await verifyJWT<RefreshTokenPayload>(refreshToken, authConfig.refreshToken.secret);
      console.log('[MIDDLEWARE] Refresh токен валиден');

      // Разная логика для API и обычных запросов
      if (isApiRequest) {
        console.log('[MIDDLEWARE] API запрос, выполняем прямое обновление токенов');

        try {
          // Вызываем API обновления токенов напрямую
          const baseUrl = new URL('/', request.url).origin;
          const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            console.error('[MIDDLEWARE] Ошибка обновления токенов:', refreshResponse.status);
            // Если не удалось обновить токены, пропускаем запрос дальше,
            // он завершится ошибкой 401 в API-контроллере
            const response = NextResponse.next();
            return response;
          }

          // Получаем новые токены
          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.accessToken;
          const newRefreshToken = refreshData.refreshToken;

          console.log('[MIDDLEWARE] Токены успешно обновлены');

          // Создаем новые заголовки для запроса с новым токеном
          const newHeaders = new Headers(request.headers);
          newHeaders.set('Authorization', `Bearer ${newAccessToken}`);

          // Важно: создаем новый запрос с тем же методом и телом, но с новым заголовком
          const response = NextResponse.next({
            request: {
              headers: newHeaders,
            },
          });

          // Устанавливаем cookies с новыми токенами
          const cookieOptions = {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
          };

          response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
            ...cookieOptions,
            maxAge: authConfig.accessToken.maxAge,
          });

          response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
            ...cookieOptions,
            maxAge: authConfig.refreshToken.maxAge,
          });

          // После успешного обновления токенов, продолжаем запрос
          console.log(
            '[MIDDLEWARE] Токены успешно обновлены, продолжаем запрос с новыми токенами и заголовком Authorization',
          );
          return response;
        } catch (error) {
          console.error('[MIDDLEWARE] Ошибка при обновлении токенов:', error);
          // В случае ошибки пропускаем запрос дальше
          // он завершится ошибкой 401 в API-контроллере
          const response = NextResponse.next();
          return response;
        }
      } else {
        // Для не-API запросов используем редирект
        const returnUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
        const baseUrl = new URL('/', request.url).origin;
        const refreshReturnUrl = `${baseUrl}/api/auth/refresh-return?returnUrl=${returnUrl}&token=${refreshToken}`;
        console.log('[MIDDLEWARE] Перенаправление на API обновления:', refreshReturnUrl);
        return NextResponse.redirect(refreshReturnUrl);
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Ошибка проверки refresh токена:', error);

      if (isApiRequest) {
        // Для API запросов просто пропускаем с 401
        console.log('[MIDDLEWARE] API запрос с невалидным refresh токеном, пропускаем с 401');
        const response = NextResponse.next();
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);
        return response;
      } else {
        // Для не-API запросов перенаправляем на логин
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Важно: исключаем путь обновления токенов из обработки middleware
export const config = {
  matcher: [
    '/((?!api/auth/refresh-return|api/auth/refresh|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
