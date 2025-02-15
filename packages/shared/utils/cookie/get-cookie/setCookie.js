//shared/utils/cookie/get-cookie/setCookie.ts
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
export const setCookie = (res, name, value, options) => {
    const newResponse = NextResponse.next(res);
    newResponse.headers.append('Set-Cookie', serialize(name, value, {
        ...options,
        expires: options.maxAge ? new Date(Date.now() + options.maxAge * 1000) : undefined,
    }));
    return newResponse;
};
