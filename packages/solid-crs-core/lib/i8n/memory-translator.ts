import { registerTranslateConfig, use, get } from '@appnest/lit-translate';
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
  constructor(public translation?: unknown, public lng?: string) {

    registerTranslateConfig({
      loader: () => fetch(`/${this.lng}.json`).then((res) => res.json()),
    });

    use(this.lng);

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

  translate(key: string): string {

    if (!key) {

      throw new ArgumentError('Argument key should be set.', key);

    }

    return get(key);

  }

  async setLng(lng: string): Promise<void>{

    this.lng = lng;
    await use(lng);

  }

}
