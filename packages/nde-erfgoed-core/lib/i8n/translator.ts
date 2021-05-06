/**
 * An abstract definition of a class which can retrieve translations.
 */
export abstract class Translator {

  /**
   * Translates a key to a specific locale.
   *
   * @param locale The locale to which the message should be translated.
   * @param key The key of the translation.
   * @returns The corresponding translation.
   */
  abstract translate(key: string, locale?: string): string;

}
