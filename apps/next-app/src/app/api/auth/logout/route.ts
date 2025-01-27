import { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@shared/utils/cookie/generate-cookie/cookieName';

<<<<<<< HEAD
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));

  //Очистка кук NextAuth
  const cookiesToDelete = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
  ];

  cookiesToDelete.forEach((cookie) => {
    response.cookies.set(cookie, '', {
      maxAge: -1,
      path: '/',
    });
  });

  try {
    const token = await getToken({ req: request as any });
    if (token) {
    }
  } catch (error) {
    console.error('Session invalidation error:', error);
  }
=======
export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  //Удаляем куки
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5

  return response;
}
