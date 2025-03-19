// app/api/auth/refresh-return/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';
import { verifyJWT, createJWT } from '@shared/utils/parse-jwt/parseJwt';
import { getCookieOptions } from '@next-app/src/utils/get-cookie/getCookieOptions';

interface RefreshTokenPayload {
  uuid: string;
  sessionId: string;
  refreshToken: string;
}

const processingTokens = new Map<string, boolean>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refreshToken = searchParams.get('token');
    const returnUrl = searchParams.get('returnUrl') || '/';

    console.log('[REFRESH-RETURN] Шаг 1: Получены параметры:', {
      url: request.url,
      returnUrl,
      tokenLength: refreshToken ? refreshToken.length : 0,
    });

    if (!refreshToken) {
      console.log('[REFRESH-RETURN] Ошибка: Отсутствует токен, перенаправление на /login');
      return redirectToLogin(request);
    }

    if (processingTokens.has(refreshToken)) {
      console.log('[REFRESH-RETURN] Токен уже обрабатывается, пропускаем дубликат запроса');
      return redirectToReturnUrl(request, returnUrl);
    }

    processingTokens.set(refreshToken, true);
    setTimeout(() => processingTokens.delete(refreshToken), 10000);

    console.log('[REFRESH-RETURN] Шаг 2: Проверка refresh-токена...');
    const payload = await verifyJWT<RefreshTokenPayload>(
      refreshToken,
      authConfig.refreshToken.secret,
    );
    console.log('[REFRESH-RETURN] Токен верифицирован, UUID пользователя:', payload.uuid);

    console.log('[REFRESH-RETURN] Шаг 3: Поиск пользователя в базе данных...');
    const user = await prisma.user.findFirst({
      where: {
        uuid: payload.uuid,
        refreshTokens: { has: payload.refreshToken },
      },
      select: {
        uuid: true,
        email: true,
        role: true,
        refreshTokens: true,
      },
    });

    if (!user) {
      console.log('[REFRESH-RETURN] Ошибка: Пользователь не найден или токен отсутствует в списке');
      processingTokens.delete(refreshToken);
      return redirectToLogin(request);
    }

    console.log('[REFRESH-RETURN] Пользователь найден:', { email: user.email, role: user.role });

    console.log('[REFRESH-RETURN] Шаг 4: Генерация новых токенов...');
    const newAccessToken = await createJWT(
      {
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        sessionId: payload.sessionId,
      },
      authConfig.accessToken.secret,
      authConfig.accessToken.expiresIn,
    );

    const newRefreshTokenUUID = uuidv4();
    const newRefreshToken = await createJWT(
      {
        uuid: user.uuid,
        sessionId: payload.sessionId,
        refreshToken: newRefreshTokenUUID,
      },
      authConfig.refreshToken.secret,
      authConfig.refreshToken.expiresIn,
    );

    console.log('[REFRESH-RETURN] Шаг 5: Обновление токенов в базе данных...');
    const updatedRefreshTokens = user.refreshTokens
      .filter((token) => token !== payload.refreshToken)
      .concat(newRefreshTokenUUID);

    await prisma.user.update({
      where: { uuid: user.uuid },
      data: {
        refreshTokens: updatedRefreshTokens,
        lastActive: new Date(),
      },
    });

    const response = redirectToReturnUrl(request, returnUrl);
    const cookieOptions = getCookieOptions(request);
    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      ...cookieOptions,
      maxAge: authConfig.accessToken.maxAge,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      ...cookieOptions,
      maxAge: authConfig.refreshToken.maxAge,
    });

    processingTokens.delete(refreshToken);
    console.log('[REFRESH-RETURN] Успешное обновление токенов, перенаправление на:', returnUrl);
    return response;
  } catch (error) {
    console.error('[REFRESH-RETURN] ОШИБКА:', error);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

function redirectToReturnUrl(request: NextRequest, returnUrl: string): NextResponse {
  const baseUrl = new URL('/', request.url).origin;
  const decodedUrl = decodeURIComponent(returnUrl);
  const fullRedirectUrl = decodedUrl.startsWith('http')
    ? decodedUrl
    : `${baseUrl}${decodedUrl.startsWith('/') ? decodedUrl : `/${decodedUrl}`}`;
  return NextResponse.redirect(fullRedirectUrl);
}
