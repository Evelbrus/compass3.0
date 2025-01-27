import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';

export async function middleware(request: NextRequest) {
  //Извлекаем куки accessToken и refreshToken
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  //Логируем значения кук для отладки (опционально)
  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);

  //Если есть accessToken, но нет refreshToken, удаляем все куки
  if (accessToken && !refreshToken) {
    const response = NextResponse.next();

    //Удаляем куки accessToken и refreshToken
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    //Логируем действие (опционально)
    console.log('Удалены куки: accessToken и refreshToken');

    return response;
  }

  //Продолжаем обработку запроса
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)'],
};
