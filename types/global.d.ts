import { DefineLocaleMessage, Locale, LocaleMessages } from "vue-i18n";

export interface I18nOptions {
  translations: Record<string, any>,
  locales: Record<string, string>,
  locale: string,
}

export interface I18nPlugin {
  translate: (key: string, vars?: Record<string, unknown>) => string,
  currentLocale: string,
  options: Record<string, string>,
  locales: string[],
}

declare function defineI18nLocale<Messages = LocaleMessages<DefineLocaleMessage>, Locales = Locale>(
  loader: (locale: Locales) => Messages | Promise<Messages>
): (locale: Locales) => Messages | Promise<Messages>

export { }