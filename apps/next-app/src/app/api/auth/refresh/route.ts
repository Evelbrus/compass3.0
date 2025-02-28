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
  console.log('[REFRESH] Начало обработки запроса на обновление токенов');

  try {
    if (!authConfig.accessToken.secret || !authConfig.refreshToken.secret) {
      console.error('[REFRESH] JWT секреты не настроены');
      throw new Error('Конфигурация JWT не настроена');
    }

    // Извлечение refresh-токена из тела запроса
    const requestBody = await request.json();
    console.log('[REFRESH] Тело запроса:', requestBody);

    const { refreshToken: receivedRefreshToken } = requestBody;
    if (!receivedRefreshToken) {
      console.error('[REFRESH] Токен обновления отсутствует в запросе');
      const response = NextResponse.json(
        { message: 'Отсутствует токен обновления' },
        { status: 400 }
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
        authConfig.refreshToken.secret
      );
      console.log('[REFRESH] Верификация токена прошла успешно:', payload);
    } catch (error) {
      console.error('[REFRESH] Ошибка верификации токена:', error);
      const response = NextResponse.json(
        { message: 'Неверный токен обновления' },
        { status: 401 }
      );
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
      console.error('[REFRESH] Пользователь не найден или токен отсутствует в базе');
      const response = NextResponse.json(
        { message: 'Неверный токен обновления' },
        { status: 401 }
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      deleteAllCookies(response, request);
      return response;
    }
    console.log('[REFRESH] Пользователь найден:', user.uuid);

    // Генерация нового access-токена
    const newAccessToken = await createJWT(
      {
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        sessionId: payload.sessionId,
      },
      authConfig.accessToken.secret,
      authConfig.accessToken.expiresIn
    );
    console.log('[REFRESH] Новый access-токен создан');

    // Генерация нового refresh-токена с новым UUID
    const newRefreshTokenUUID = uuidv4();
    const newRefreshToken = await createJWT(
      {
        uuid: user.uuid,
        sessionId: payload.sessionId,
        refreshToken: newRefreshTokenUUID,
      },
      authConfig.refreshToken.secret,
      authConfig.refreshToken.expiresIn
    );
    console.log('[REFRESH] Новый refresh-токен создан:', newRefreshTokenUUID);

    // Обновление массива refresh-токенов: удаление использованного и добавление нового
    const updatedRefreshTokens = user.refreshTokens
      .filter(token => token !== payload.refreshToken)
      .concat(newRefreshTokenUUID);
    console.log('[REFRESH] Обновлённый массив refresh-токенов:', updatedRefreshTokens);

    await prisma.user.update({
      where: { uuid: user.uuid },
      data: {
        refreshTokens: updatedRefreshTokens,
        lastActive: new Date(),
      },
    });
    console.log('[REFRESH] Данные пользователя обновлены в базе');

    // Формирование ответа с новыми токенами
    const response = NextResponse.json(
      {
        message: 'Токены успешно обновлены',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 }
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

    console.log('[REFRESH] Новые cookies установлены');
    return response;
  } catch (error) {
    console.error('[REFRESH] Неожиданная ошибка:', error);
    const response = NextResponse.json(
      { message: 'Внутренняя ошибка сервера, попробуйте позже' },
      { status: 500 }
    );
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }
}
