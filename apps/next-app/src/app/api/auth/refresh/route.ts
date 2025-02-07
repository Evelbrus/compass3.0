import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';

export async function POST(request: NextRequest) {
  try {
    if (!authConfig.accessToken.secret || !authConfig.refreshToken.secret) {
      throw new Error('Секреты для JWT не настроены');
    }

    const { refreshToken: receivedRefreshToken } = await request.json();

    if (!receivedRefreshToken) {
      return NextResponse.json({ message: 'Refresh token обязателен' }, { status: 400 });
    }

    //Проверяем refreshToken из запроса
    const refreshTokenSecret = new TextEncoder().encode(authConfig.refreshToken.secret);
    let payload;
    try {
      const result = await jwtVerify(receivedRefreshToken, refreshTokenSecret);
      payload = result.payload;
    } catch (error) {
      return NextResponse.json({ message: 'Неверный refresh token' }, { status: 401 });
    }

    //Извлекаем refreshToken (UUID) из payload JWT
    const refreshTokenUUID = payload.refreshToken as string;

    if (!refreshTokenUUID) {
      return NextResponse.json({ message: 'Неверный refresh token' }, { status: 401 });
    }

    //Ищем пользователя по uuid и проверяем, что refreshTokenUUID есть в массиве refreshTokens
    const user = await prisma.user.findFirst({
      where: {
        uuid: payload.uuid as string,
        refreshTokens: {
          has: refreshTokenUUID,
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
      //Удаляем куки
      const response = NextResponse.json({ message: 'Неверный refresh token' }, { status: 401 });

      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);

      return response;
    }

    //Проверяем, что sessionVersion из токена совпадает с sessionVersion в базе данных
    if (payload.sessionVersion !== user.sessionVersion) {
      return NextResponse.json({ message: 'Несоответствие версии сессии' }, { status: 401 });
    }
    //Генерация нового accessToken
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

    //Генерация нового refreshToken (UUID)
    const newRefreshTokenUUID = uuidv4();

    //Создаем новый refreshToken (JWT)

    const newRefreshToken = await new SignJWT({
      uuid: user.uuid,
      sessionVersion: user.sessionVersion,
      refreshToken: newRefreshTokenUUID,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(authConfig.refreshToken.expiresIn)
      .sign(refreshTokenSecret);

    //Обновляем массив refreshTokens: удаляем старый и добавляем новый
    const updatedRefreshTokens = user.refreshTokens
      .filter((token) => token !== refreshTokenUUID)
      .concat(newRefreshTokenUUID);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { uuid: user.uuid },
        data: {
          refreshTokens: {
            set: updatedRefreshTokens,
          },
          lastActive: new Date(),
        },
      });
    });

    const response = NextResponse.json(
      {
        message: 'Токены успешно обновлены',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 },
    );

    //Устанавливаем новые токены в куки
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
    return NextResponse.json(
      { message: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.' },
      { status: 500 },
    );
  }
}
