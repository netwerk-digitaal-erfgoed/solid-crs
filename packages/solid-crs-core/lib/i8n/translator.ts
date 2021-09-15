/**
 * An abstract definition of a class which can retrieve translations.
 */
export abstract class Translator {

  /**
   * Translates a key to a specific locale.
   *
   * @param key The key of the translation.
   * @returns The corresponding translation.
   */
  abstract translate(key: string): string;

  /**
   * Returns the language currently used by translator
   *
   * @returns The language currently used by translator
   */
  abstract getLang(): string;

  /**
   * Updates the translator's language if a relevant translation file exists
   * for this new language. Otherwise, falls back to the previously used language
   *
   * @param lang The new language to use
   */
  abstract setLang(lang: string): Promise<void>;

}

export const TRANSLATIONS_LOADED = 'TRANSLATIONS_LOADED';

export class TranslationsLoadedEvent extends CustomEvent<unknown> {

  constructor() {

    super(TRANSLATIONS_LOADED);

  }

}
