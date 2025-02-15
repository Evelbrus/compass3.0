import { cookies } from 'next/headers';
import { LANG_COOKIE, REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { mapLanguageCode } from '@shared/utils/language';
import { prisma } from '@shared/prisma/prisma-client';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';
export async function getLayoutData() {
    const allCookies = await cookies();
    const accessToken = allCookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = allCookies.get(REFRESH_TOKEN_COOKIE)?.value;
    const langCode = allCookies.get(LANG_COOKIE)?.value || 'ru';
    let userSession = null;
    let role;
    const lang = mapLanguageCode(langCode);
    if (accessToken) {
        try {
            const payload = await verifyJWT(accessToken, authConfig.accessToken.secret);
            //Проверяем только наличие uuid
            if (!payload.uuid) {
                throw new Error('Invalid token payload structure');
            }
            const user = await prisma.user.findUnique({
                where: { uuid: payload.uuid },
                select: {
                    uuid: true,
                    email: true,
                    role: true,
                    isBlocked: true,
                    lastActive: true,
                },
            });
            if (user && !user.isBlocked) {
                role = user.role;
                userSession = {
                    uuid: user.uuid,
                    email: user.email,
                    role: user.role,
                    lastActive: user.lastActive,
                };
            }
        }
        catch (error) {
            console.error('Session verification error:', error instanceof Error ? error.message : 'Unknown error');
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
