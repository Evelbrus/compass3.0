import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { LANG_COOKIE, REFRESH_TOKEN_COOKIE } from '@shared/utils/cookie';
import { LanguageCode, mapLanguageCode } from '@shared/utils/language';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { UserRole } from '@prisma/client';

export async function getLayoutData() {
  const allCookies = await cookies();

  const accessToken = allCookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = allCookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const langCode = (allCookies.get(LANG_COOKIE)?.value as LanguageCode) || 'ru';

  let isAuthenticated = false;
  let userSession: UserSession | null = null;
  let role: UserRole | undefined;
  const lang = mapLanguageCode(langCode);

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(authConfig.accessToken.secret),
      );

      if (typeof payload.uuid !== 'string' || typeof payload.sessionVersion !== 'number') {
        throw new Error('Invalid token payload structure');
      }

      const user = await prisma.user.findUnique({
        where: { uuid: payload.uuid as string },
        select: {
          uuid: true,
          email: true,
          role: true,
          sessionVersion: true,
          isBlocked: true,
          lastActive: true,
        },
      });

      if (user && !user.isBlocked && user.sessionVersion === payload.sessionVersion) {
        isAuthenticated = true;
        role = user.role;
        userSession = {
          uuid: user.uuid,
          email: user.email,
          role: user.role,
          lastActive: user.lastActive,
        };
      }
    } catch (error) {
      console.error(
        'Session verification error:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  return {
    isAuthenticated,
    accessToken,
    refreshToken,
    lang,
    userSession,
    role,
  };
}
