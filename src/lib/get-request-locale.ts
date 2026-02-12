import { defaultLocale, locales, type Locale } from "@/i18n/config";

/**
 * Extracts locale from the X-Locale header, with validation and fallback.
 */
export function getRequestLocale(request: Request): Locale {
  const header = request.headers.get("X-Locale");
  if (header && locales.includes(header as Locale)) {
    return header as Locale;
  }
  return defaultLocale;
}
