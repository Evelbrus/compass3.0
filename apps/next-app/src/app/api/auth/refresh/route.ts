import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';

export async function POST(request: NextRequest) {
  try {
    //Проверяем, что секре́ты для JWT сконфигурированы
    if (!authConfig.accessToken.secret || !authConfig.refreshToken.secret) {
      throw new Error('JWT secrets not configured');
    }

    //Извлекаем данные из тела запроса
    const { refreshToken: receivedRefreshToken, loginAttemptId } = await request.json();

    //Если refreshToken отсутствует
    if (!receivedRefreshToken) {
      const response = NextResponse.json({ message: 'Refresh token is required' }, { status: 400 });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Если loginAttemptId не передан
    if (!loginAttemptId) {
      const response = NextResponse.json(
        { message: 'loginAttemptId is required' },
        { status: 400 },
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Подготавливаем секрет для проверки refresh‑токена
    const refreshTokenSecret = new TextEncoder().encode(authConfig.refreshToken.secret);
    let payload;
    try {
      //Верифицируем refresh‑токен и извлекаем payload
      const result = await jwtVerify(receivedRefreshToken, refreshTokenSecret);
      payload = result.payload;
    } catch (error) {
      console.error('[REFRESH] Error verifying refresh token:', error);
      const response = NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Извлекаем loginAttemptId из payload
    const tokenLoginAttemptId = payload.loginAttemptId as string;
    if (tokenLoginAttemptId !== loginAttemptId) {
      console.error(
        '[REFRESH] loginAttemptId mismatch. Received:',
        loginAttemptId,
        'Token contains:',
        tokenLoginAttemptId,
      );
      const response = NextResponse.json(
        { message: 'Invalid loginAttemptId in refresh token' },
        { status: 401 },
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Проверяем, что пользователь существует и что refresh‑токен зарегистрирован в базе
    const user = await prisma.user.findFirst({
      where: {
        uuid: payload.uuid as string,
        refreshTokens: {
          has: payload.refreshToken as string,
        },
      },
      select: {
        uuid: true,
        email: true,
        role: true,
        sessionVersion: true,
        refreshTokens: true,
      },
    });

    if (!user) {
      console.error('[REFRESH] User not found or refresh token missing in DB');
      const response = NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Проверяем, что версия сессии в токене совпадает с версией в базе
    if (payload.sessionVersion !== user.sessionVersion) {
      console.error(
        '[REFRESH] Session version mismatch. Token:',
        payload.sessionVersion,
        'DB:',
        user.sessionVersion,
      );
      const response = NextResponse.json({ message: 'Session version mismatch' }, { status: 401 });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Генерируем новый access‑токен
    const accessTokenSecret = new TextEncoder().encode(authConfig.accessToken.secret);
    const newAccessToken = await new SignJWT({
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(authConfig.accessToken.expiresIn)
      .sign(accessTokenSecret);

    //Генерируем новый refresh‑токен с новым значением refreshToken (UUID)
    const newRefreshTokenUUID = uuidv4();
    const newRefreshToken = await new SignJWT({
      uuid: user.uuid,
      sessionVersion: user.sessionVersion,
      refreshToken: newRefreshTokenUUID,
      loginAttemptId, //Используем то же значение, что передали в запросе
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(authConfig.refreshToken.expiresIn)
      .sign(refreshTokenSecret);

    //Обновляем refresh‑токены в базе: удаляем старое значение и добавляем новое
    const updatedRefreshTokens = user.refreshTokens
      .filter((token) => token !== (payload.refreshToken as string))
      .concat(newRefreshTokenUUID);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { uuid: user.uuid },
        data: {
          refreshTokens: updatedRefreshTokens,
          lastActive: new Date(),
        },
      });
    });

    //Формируем ответ с новыми токенами
    const response = NextResponse.json(
      {
        message: 'Tokens successfully refreshed',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 },
    );

    //Обновляем куки с access‑и refresh‑токенами
    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authConfig.accessToken.maxAge,
      path: '/',
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authConfig.refreshToken.maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[REFRESH] Unexpected error:', error);
    const response = NextResponse.json(
      { message: 'Unexpected error. Please try again later.' },
      { status: 500 },
    );
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }
}
