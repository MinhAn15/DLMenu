import { getRequestConfig } from 'next-intl/server';

const locales = ['vi', 'en'];
const defaultLocale = 'vi';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && locales.includes(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
