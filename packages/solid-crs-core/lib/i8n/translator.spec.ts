import { MockTranslator } from './mock-translator';
import { TRANSLATIONS_LOADED } from './translator';

describe('Translator', () => {

  let service: MockTranslator;

  beforeEach(async () => {

    service = new MockTranslator('en-GB');

  });

  it('should create', () => {

    expect(service).toBeTruthy();

  });

  describe('addEventListener', () => {

    it('should dispatch event when loaded is true', (done) => {

      service.addEventListener(TRANSLATIONS_LOADED, () => done());

    });

    it('should not dispatch event when loaded is false', () => {

      service.loaded = false;
      service.dispatchEvent = jest.fn();
      service.addEventListener(TRANSLATIONS_LOADED, () => undefined);
      expect(service.dispatchEvent).not.toHaveBeenCalled();

    });

  });

});
