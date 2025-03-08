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
      throw new Error('Конфигурация JWT не настроена');
    }

    // Извлечение refresh-токена из тела запроса
    const requestBody = await request.json();

    const { refreshToken: receivedRefreshToken } = requestBody;
    if (!receivedRefreshToken) {
      const response = NextResponse.json(
        { message: 'Отсутствует токен обновления' },
        { status: 400 },
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    // Верификация refresh-токена
    let payload: RefreshTokenPayload;
    try {
      payload = await verifyJWT<RefreshTokenPayload>(
        receivedRefreshToken,
        authConfig.refreshToken.secret,
      );
    } catch (error) {
      const response = NextResponse.json({ message: 'Неверный токен обновления' }, { status: 401 });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    // Поиск пользователя по uuid и проверка наличия refresh-токена в базе
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
      const response = NextResponse.json({ message: 'Неверный токен обновления' }, { status: 401 });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      deleteAllCookies(response, request);
      return response;
    }

    // Генерация нового access-токена
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

    // Генерация нового refresh-токена с новым UUID
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

    // Обновление массива refresh-токенов: удаление использованного и добавление нового
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

    // Формирование ответа с новыми токенами
    const response = NextResponse.json(
      {
        message: 'Токены успешно обновлены',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 },
    );

    // Установка новых cookie
    const cookieOptions = getCookieOptions(request);
    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      ...cookieOptions,
      maxAge: authConfig.accessToken.maxAge,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      ...cookieOptions,
      maxAge: authConfig.refreshToken.maxAge,
    });

    return response;
  } catch (error) {
    console.error('[REFRESH] Неожиданная ошибка:', error);
    const response = NextResponse.json(
      { message: 'Внутренняя ошибка сервера, попробуйте позже' },
      { status: 500 },
    );
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }
}
