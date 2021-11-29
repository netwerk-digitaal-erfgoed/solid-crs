import { registerTranslateConfig, use, get, Values, ValuesCallback, ITranslateConfig, Strings } from '@appnest/lit-translate';
import { ArgumentError } from '../errors/argument-error';
import { TranslationsLoadedEvent, Translator } from './translator';

/**
 * An implementation of a Translator which stores translations in-memory.
 */
export class MemoryTranslator extends Translator {

  /**
   * Instantiates a MemoryTranslator.
   *
   * @param lang The default locale to use when translating.
   */
  constructor(public lang: string) {

    super();
    this.setLang(lang);

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
  getLang(): string {

    return this.lang;

  }

  /**
   * Updates the translator's language if a relevant translation file exists
   * for this new language. Otherwise, falls back to the previously used language
   *
   * @param lang The new language to use
   */
  async setLang(lang: string): Promise<void>{

    this.loaded = false;

    let translations: Promise<Strings>;

    try {

      translations = await (await fetch(`${window.location.origin}/${lang}.json`)).json();
      this.lang = lang;

    } catch(e) {

      translations = await (await fetch(`${window.location.origin}/${this.lang}.json`)).json();

    }

    registerTranslateConfig({
      loader: async () => translations,
    });

    await use(this.lang);

    this.loaded = true;
    this.dispatchEvent(new TranslationsLoadedEvent());

  }

}
