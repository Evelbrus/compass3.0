import { cookies } from 'next/headers';
import { LANG_COOKIE, REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { LanguageCode, mapLanguageCode } from '@shared/utils/language';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { UserRole } from '@prisma/client';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';
import { UserSession } from '@shared/prisma/interface/users/interface';

export async function getLayoutData() {
  const allCookies = await cookies();

  const accessToken = allCookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = allCookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const langCode = (allCookies.get(LANG_COOKIE)?.value as LanguageCode) || 'ru';

  let userSession: UserSession | null = null;
  let role: UserRole | undefined;
  const lang = mapLanguageCode(langCode);

  if (accessToken) {
    try {
      const payload = await verifyJWT<UserSession>(accessToken, authConfig.accessToken.secret);
      // Проверяем только наличие uuid
      if (!payload.uuid) {
        throw new Error('Invalid token payload structure');
      }

      // Запрос к базе данных с добавлением phone и companyProfile
      const user = await prisma.user.findUnique({
        where: { uuid: payload.uuid },
        select: {
          uuid: true,
          email: true,
          fullName: true,
          role: true,
          isBlocked: true,
          lastActive: true,
          phone: true,
          companyProfile: {
            select: {
              companyName: true,
              phone: true,
              logoImagePath: true,
            },
          },
        },
      });

      if (user && !user.isBlocked) {
        role = user.role;
        userSession = {
          uuid: user.uuid,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          lastActive: user.lastActive,
          phone: user.phone,
          companyProfile: user.companyProfile
            ? {
                companyName: user.companyProfile.companyName,
                phone: user.companyProfile.phone,
                logoImagePath: user.companyProfile.logoImagePath,
              }
            : null,
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
    accessToken,
    refreshToken,
    lang,
    userSession,
    role,
  };
}
