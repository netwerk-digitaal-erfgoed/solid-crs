import { ArgumentError } from '../errors/argument-error';
import { Translation } from './translation';

/**
 * An implementation of a Translator which stores translations in-memory.
 */
export class MemoryTranslator {
  /**
   * Instantiates a MemoryTranslator.
   *
   * @param translations The translations to be stored in-memory.
   * @param defaultLocale The default locale to use when translating.
   */
  constructor(public translations: Translation[], public defaultLocale: string) { }

  /**
   * Translates a key to a specific locale.
   *
   * @param key The key of the translation.
   * @param locale The locale to which the message should be translated. Overrides the default locale.
   * @returns The translated text.
   *
   * @throws {@link ArgumentError}
   * This error is thrown when either no locale or key have been given.
   */
  translate(key: string, locale?: string): string {
    if (!key) {
      throw new ArgumentError('Argument key should be set.', key);
    }

    if (!locale && ! this.defaultLocale) {
      throw new ArgumentError('Argument locale should be set.', locale);
    }

    // Use default locale if no locale was passed to function
    const usedLocale = locale? locale : this.defaultLocale;

    // Find translation based on locale
    const foundTranslation = this.translations?.find((translation) => translation.locale === usedLocale && translation.key === key);

    // return key when no translation was found
    return foundTranslation?.value || key;
  }
}
