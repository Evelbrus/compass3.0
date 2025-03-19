import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';
import { createJWT, verifyJWT } from '@shared/utils/parse-jwt/parseJwt';
import { getCookieOptions } from '@next-app/src/utils/get-cookie/getCookieOptions';
import { deleteAllCookies } from '@next-app/src/utils/delete-cookie/deleteAllCookies';

interface RefreshTokenPayload {
  uuid: string;
  sessionId: string;
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!authConfig.accessToken.secret || !authConfig.refreshToken.secret) {
      console.error('[REFRESH] JWT секреты не настроены');
      return errorResponse(request, 'Конфигурация сервера не настроена', 500);
    }

    const requestBody = await request.json();
    const { refreshToken: receivedRefreshToken } = requestBody;

    console.log('[REFRESH] Получен refresh-токен:', {
      tokenLength: receivedRefreshToken?.length || 0,
    });

    if (!receivedRefreshToken) {
      console.log('[REFRESH] Ошибка: Отсутствует токен обновления');
      return errorResponse(request, 'Отсутствует токен обновления', 400);
    }

    let payload: RefreshTokenPayload;
    try {
      payload = await verifyJWT<RefreshTokenPayload>(
        receivedRefreshToken,
        authConfig.refreshToken.secret,
      );
      console.log('[REFRESH] Токен верифицирован, UUID:', payload.uuid);
    } catch (error) {
      console.log('[REFRESH] Ошибка верификации токена:', error);
      return errorResponse(request, 'Неверный токен обновления', 401);
    }

    console.log('[REFRESH] Поиск пользователя в базе...');
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
      console.log('[REFRESH] Пользователь не найден или токен отсутствует в списке:', {
        uuid: payload.uuid,
        refreshToken: payload.refreshToken,
      });
      return errorResponse(request, 'Неверный токен обновления', 401);
    }

    console.log('[REFRESH] Пользователь найден:', { email: user.email, role: user.role });

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

    console.log('[REFRESH] Обновление токенов в базе...');
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

    console.log('[REFRESH] Токены успешно обновлены');
    return successResponse(request, newAccessToken, newRefreshToken);
  } catch (error) {
    console.error('[REFRESH] Неожиданная ошибка:', error);
    return errorResponse(request, 'Внутренняя ошибка сервера, попробуйте позже', 500);
  }
}

function errorResponse(request: NextRequest, message: string, status: number): NextResponse {
  const response = NextResponse.json({ message }, { status });
  deleteAllCookies(response, request); // Удаляем все куки
  return response;
}

function successResponse(
  request: NextRequest,
  accessToken: string,
  refreshToken: string,
): NextResponse {
  const response = NextResponse.json(
    {
      message: 'Токены успешно обновлены',
      accessToken,
      refreshToken,
    },
    { status: 200 },
  );

  const cookieOptions = getCookieOptions(request);
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: authConfig.accessToken.maxAge,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: authConfig.refreshToken.maxAge,
  });

  return response;
}
