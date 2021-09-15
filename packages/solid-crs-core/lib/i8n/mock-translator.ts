import { Translator } from './translator';

export class MockTranslator extends Translator {

  constructor(public lang: string = 'nl-NL') {

    super();

  }

  translate(key: string): string {

    return key;

  }

  getLang(): string {

    return this.lang;

  }
  setLang(lang: string): Promise<void> {

    this.lang = lang;

    return undefined;

  }

}
