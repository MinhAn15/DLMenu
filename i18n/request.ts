import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get('dilinh-locale')?.value;
  const acceptLanguage = headerStore.get('accept-language') || '';
  const headerLocale = acceptLanguage.split(',')[0]?.trim().split('-')[0];

  const candidate = cookieLocale || headerLocale;
  const locale: Locale =
    candidate && locales.includes(candidate as Locale)
      ? (candidate as Locale)
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
