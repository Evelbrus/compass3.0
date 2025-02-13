import { NextRequest, NextResponse } from 'next/server';

export function deleteAllCookies(response: NextResponse, request: NextRequest) {
  const cookies = request.cookies.getAll();
  cookies.forEach((cookie) => {
    //Используем set с expires в прошлом для "удаления" cookie
    response.cookies.set(cookie.name, '', {
      expires: new Date(0),
      path: '/',
      domain: 'operator.garage.kg',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    console.log(`Удалена кука: ${cookie.name}`);
  });
  console.log('Отправлены заголовки Set-Cookie для удаления всех куков.');
}
