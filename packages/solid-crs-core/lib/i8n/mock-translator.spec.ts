import { MockTranslator } from './mock-translator';

describe('MockTranslator', () => {

  let service: MockTranslator;

  beforeEach(async () => {

    service = new MockTranslator('en-GB');

  });

  it('should create', () => {

    service = new MockTranslator();
    expect(service).toBeTruthy();
    expect(service.lang).toEqual('nl-NL');

    service = new MockTranslator('en-GB');
    expect(service).toBeTruthy();
    expect(service.lang).toEqual('en-GB');

  });

  describe('translate', () => {

    it('should return key', () => {

      expect(service.translate('test.key')).toEqual('test.key');

    });

  });

  describe('getLang', () => {

    it('should return lang', () => {

      expect(service.getLang()).toEqual('en-GB');

    });

  });

  describe('setLang', () => {

    it('should set lang', async () => {

      await service.setLang('nl-NL');
      expect(service.lang).toEqual('nl-NL');

    });

  });

});
