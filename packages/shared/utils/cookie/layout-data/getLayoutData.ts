import { getServerSession } from 'next-auth/next';
import { cookies } from 'next/headers';
import { LANG_COOKIE } from '@shared/utils/cookie';
import { LanguageCode, mapLanguageCode } from '@shared/utils/language';
import { authOptions } from '@shared/lib/api/authOptions';

export async function getLayoutData() {
  const allCookies = await cookies();

  // Получение сессии через next-auth
  const session = await getServerSession(authOptions);

  const isAuthenticated = !!session;
  const userProfile = session?.user || null;
  const role = userProfile?.role;

  const langCode = (allCookies.get(LANG_COOKIE)?.value as LanguageCode) || 'ru';
  const lang = mapLanguageCode(langCode);

  return {
    isAuthenticated,
    lang,
    userProfile,
    role,
  };
}
