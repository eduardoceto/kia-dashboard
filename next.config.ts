import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  // i18n: {
  //   // Required: A list of all locales you want to support
  //   locales: ['en', 'es'],

  //   // Required: The default locale to use when none is detected
  //   // Should be included in the `locales` array above
  //   defaultLocale: 'en',

  //   // Optional: Disable automatic locale detection (based on Accept-Language header)
  //   localeDetection: false,
  // },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
