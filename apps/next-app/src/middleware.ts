import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { privateRoutes, publicRoutes } from '@shared/utils/routing';
import { rolePagesMap } from '@shared/utils/routing/private/rolePagesMap';
import type { PrivatePageType } from '@shared/utils/routing';
import { UserRole } from '@prisma/client';

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });

    const isAuthenticated = !!token;
    const role = token?.role as UserRole | undefined;

    const isPrivateRoute = (Object.values(privateRoutes) as readonly string[]).includes(
      currentPath,
    );

    if (!isAuthenticated && isPrivateRoute) {
      return NextResponse.redirect(new URL(publicRoutes.LOGIN, request.url));
    }

    if (isAuthenticated && isPrivateRoute && role) {
      const privatePageKey = Object.keys(privateRoutes).find(
        (key) => privateRoutes[key as PrivatePageType] === currentPath,
      ) as PrivatePageType | undefined;

      if (privatePageKey) {
        const allowedPages = rolePagesMap[role] || [];

        if (!allowedPages.includes(privatePageKey)) {
          return NextResponse.redirect(new URL(privateRoutes.HOME, request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL(publicRoutes.LOGIN, request.url));
  }
}
