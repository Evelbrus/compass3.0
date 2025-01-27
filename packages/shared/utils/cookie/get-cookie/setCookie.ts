//shared/utils/cookie/get-cookie/setCookie.ts
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

export const setCookie = (
  res: NextResponse,
  name: string,
  value: string,
  options: CookieOptions,
): NextResponse => {
  const newResponse = NextResponse.next(res);
  newResponse.headers.append(
    'Set-Cookie',
    serialize(name, value, {
      ...options,
      expires: options.maxAge ? new Date(Date.now() + options.maxAge * 1000) : undefined,
    }),
  );
  return newResponse;
};
