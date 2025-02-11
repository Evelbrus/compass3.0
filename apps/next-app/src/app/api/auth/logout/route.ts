import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@shared/utils/cookie/generate-cookie/cookieName';

export async function POST(request: NextRequest) {
  try {
    //Пытаемся получить refresh-токен из куки
    const refreshTokenCookie = request.cookies.get(REFRESH_TOKEN_COOKIE);
    if (refreshTokenCookie) {
      const refreshTokenSecret = new TextEncoder().encode(authConfig.refreshToken.secret);
      let payload: any;
      try {
        const result = await jwtVerify(refreshTokenCookie.value, refreshTokenSecret);
        payload = result.payload;
      } catch (error) {
        console.error('Invalid refresh token during logout:', error);
      }

      if (payload && payload.uuid && payload.refreshToken) {
        //Извлекаем пользователя и удаляем из массива refreshTokens данный токен
        const user = await prisma.user.findUnique({
          where: { uuid: payload.uuid },
          select: { refreshTokens: true },
        });
        if (user) {
          const updatedTokens = user.refreshTokens.filter(
            (token) => token !== payload.refreshToken,
          );
          await prisma.user.update({
            where: { uuid: payload.uuid },
            data: { refreshTokens: updatedTokens },
          });
        }
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  //Формируем ответ и удаляем все соответствующие куки
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete('loginAttemptId');

  return response;
}
