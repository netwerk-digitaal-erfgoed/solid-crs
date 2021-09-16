import { TranslationsLoadedEvent, Translator } from './translator';

export class MockTranslator extends Translator {

  public loaded = true;

  constructor(public lang: string = 'nl-NL') {

    super();
    this.setLang(this.lang);

  }

  translate(key: string): string {

    return key;

  }

  getLang(): string {

    return this.lang;

  }
  setLang(lang: string): Promise<void> {

    this.lang = lang;
    this.loaded = true;
    this.dispatchEvent(new TranslationsLoadedEvent());

    return undefined;

  }

}
