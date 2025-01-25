import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

  return response;
}
