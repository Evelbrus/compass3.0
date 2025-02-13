import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';
import { createJWT, verifyJWT } from '@shared/utils/parse-jwt/parseJwt';

interface RefreshTokenPayload {
  uuid: string;
  sessionId: string;
  refreshToken: string;
  loginAttemptId: string;
  [key: string]: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!authConfig.accessToken.secret || !authConfig.refreshToken.secret) {
      throw new Error('JWT secrets not configured');
    }

    //Извлекаем refresh-токен и loginAttemptId из запроса
    const { refreshToken: receivedRefreshToken, loginAttemptId } = await request.json();

    if (!receivedRefreshToken || !loginAttemptId) {
      const response = NextResponse.json(
        { message: 'Refresh token and loginAttemptId are required' },
        { status: 400 },
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Верификация refresh-токена
    let payload: RefreshTokenPayload;
    try {
      payload = await verifyJWT<RefreshTokenPayload>(
        receivedRefreshToken,
        authConfig.refreshToken.secret,
      );
    } catch (error) {
      console.error('[REFRESH] Invalid refresh token:', error);
      const response = NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Проверяем соответствие loginAttemptId
    if (payload.loginAttemptId !== loginAttemptId) {
      console.error(
        '[REFRESH] loginAttemptId mismatch. Received:',
        loginAttemptId,
        'Token contains:',
        payload.loginAttemptId,
      );
      const response = NextResponse.json(
        { message: 'Invalid loginAttemptId in refresh token' },
        { status: 401 },
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    //Ищем пользователя по uuid и проверяем наличие refresh-токена в базе
    const user = await prisma.user.findFirst({
      where: {
        uuid: payload.uuid,
        refreshTokens: {
          has: payload.refreshToken,
        },
      },
      select: {
        uuid: true,
        email: true,
        role: true,
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

    //Генерируем новый access-токен (без sessionVersion)
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

    //Генерируем новый refresh-токен с новым UUID
    const newRefreshTokenUUID = uuidv4();
    const newRefreshToken = await createJWT(
      {
        uuid: user.uuid,
        sessionId: payload.sessionId,
        refreshToken: newRefreshTokenUUID,
        loginAttemptId,
      },
      authConfig.refreshToken.secret,
      authConfig.refreshToken.expiresIn,
    );

    //Обновляем refresh-токены в базе: удаляем использованный и добавляем новый
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

    const response = NextResponse.json(
      {
        message: 'Tokens successfully refreshed',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 },
    );

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
