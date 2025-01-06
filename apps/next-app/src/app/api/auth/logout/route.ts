import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/login`);

  // Удаление всех куки, связанных с next-auth
  const token = await getToken({ req: request as any });
  if (token) {
    response.cookies.set('next-auth.session-token', '', { maxAge: -1, path: '/' });
    response.cookies.set('next-auth.csrf-token', '', { maxAge: -1, path: '/' });
    response.cookies.set('next-auth.callback-url', '', { maxAge: -1, path: '/' });
  }

  return response;
}
