import { Translator } from './translator';

export class MockTranslator extends Translator {

  constructor(public lng: string = 'nl-NL') {

    super();

  }

  translate(key: string): string {

    return key;

  }

  getLng(): string {

    return this.lng;

  }
  setLng(lng: string): Promise<void> {

    this.lng = lng;

    return undefined;

  }

}
