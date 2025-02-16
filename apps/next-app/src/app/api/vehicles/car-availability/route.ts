import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';

interface JwtPayload {
  uuid: string;
  role?: string;
}

export async function PATCH(req: NextRequest) {
  //Проверяем наличие токена в cookie
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  //Верифицируем токен
  let token: JwtPayload | null = null;
  try {
    token = await verifyJWT<JwtPayload>(accessToken, authConfig.accessToken.secret);
    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  //Извлекаем данные из запроса
  const { uuid, isAvailable } = await req.json();
  if (!uuid || typeof isAvailable !== 'boolean') {
    return NextResponse.json({ status: 'error', message: 'Invalid data' }, { status: 400 });
  }

  try {
    //Обновляем поле isAvailable для указанного автомобиля
    const updatedVehicle = await prisma.vehicle.update({
      where: { uuid },
      data: { isAvailable },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Availability updated successfully',
      data: { uuid: updatedVehicle.uuid, isAvailable: updatedVehicle.isAvailable },
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
