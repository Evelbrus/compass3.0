import { NextRequest } from 'next/server';

export const getCookieOptions = (request: NextRequest) => {
  let domain: string | undefined;
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_URL);
      domain = url.hostname.replace(/^www\./, '');
    } catch (error) {
      console.error('Invalid NEXT_PUBLIC_URL format', error);
    }
  }
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'https:',
    sameSite: 'lax' as const,
    path: '/',
    domain,
  };
};
