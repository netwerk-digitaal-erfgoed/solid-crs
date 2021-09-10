import { registerTranslateConfig, use, get, Values, ValuesCallback, ITranslateConfig, Strings } from '@appnest/lit-translate';
import { ArgumentError } from '../errors/argument-error';

/**
 * An implementation of a Translator which stores translations in-memory.
 */
export class MemoryTranslator {

  /**
   * Instantiates a MemoryTranslator.
   *
   * @param lng The default locale to use when translating.
   * @param defaultLng The fallback locale to use when translating.
   */
  constructor(public lng: string) {

    this.setLng(lng);

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

  translate(key: string, values?: Values | ValuesCallback, config?: ITranslateConfig): string {

    if (!key) {

      throw new ArgumentError('Argument key should be set.', key);

    }

    return get(key, values, config);

  }

  /**
   * Returns the language currently used by translator
   *
   * @returns The language currently used by translator
   */
  getLng(): string {

    return this.lng;

  }

  /**
   * Updates the translator's language if a relevant translation file exists
   * for this new language. Otherwise, falls back to the previously used language
   *
   * @param lng The new language to use
   */
  async setLng(lng: string): Promise<void>{

    const lang = this.lng;
    let translations: Promise<Strings>;

    try {

      translations = await (await fetch(`${window.location.origin}/${lng}.json`)).json();
      this.lng = lng;

    } catch(e) {

      translations = await (await fetch(`${window.location.origin}/${lang}.json`)).json();

    }

    registerTranslateConfig({
      loader: async () => translations,
    });

    await use(this.lng);

  }

}
