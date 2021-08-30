import i18next from 'i18next';
import { ArgumentError } from '../errors/argument-error';

/**
 * An implementation of a Translator which stores translations in-memory.
 */
export class MemoryTranslator {

  /**
   * Instantiates a MemoryTranslator.
   *
   * @param translation The translations to be stored in-memory.
   * @param defaultLocale The default locale to use when translating.
   */
  constructor(public translation: unknown, public lng: string) {

    i18next.init({
      lng,
      resources: {
        [lng]: {
          translation,
        },
      },
      nsSeparator: false,
    });

  }

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

    if (!locale && ! this.lng) {

      throw new ArgumentError('Argument locale should be set.', locale);

    }

    // Use default locale if no locale was passed to function
    const usedLocale = locale? locale : this.lng;

    // Find translation based on locale
    // const foundTranslation = this.translations?.find(
    //   (translation) => translation.locale === usedLocale && translation.key === key
    // );

    // // return key when no translation was found
    // return foundTranslation?.value || key;

    return i18next.t(key, { lng: usedLocale });

  }

}
