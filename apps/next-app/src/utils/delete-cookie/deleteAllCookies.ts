import { NextResponse, NextRequest } from 'next/server';
import { getCookieOptions } from '@next-app/src/utils/get-cookie/getCookieOptions';

export function deleteAllCookies(response: NextResponse, request: NextRequest) {
  const cookies = request.cookies.getAll(); // Получаем все куки из запроса
  const cookieOptions = getCookieOptions(request); // Получаем опции, включая domain

  cookies.forEach((cookie) => {
    response.cookies.set(cookie.name, '', {
      ...cookieOptions, // Используем те же опции, что при установке
      expires: new Date(0), // Устанавливаем дату истечения в прошлое
    });
  });
}
