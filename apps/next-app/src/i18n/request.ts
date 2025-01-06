import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { LANG_COOKIE } from '@shared/utils/cookie/generate-cookie/cookieName';

export default getRequestConfig(async () => {
  const langCookie = (await cookies()).get(LANG_COOKIE)?.value || 'ru';

  try {
    const messages = (await import(`../../messages/${langCookie}/common.json`)).default;
    return {
      locale: langCookie,
      messages,
    };
  } catch {
    const defaultMessages = (await import(`../../messages/ru/common.json`)).default;
    return {
      locale: 'ru',
      messages: defaultMessages,
    };
  }
});
