import fetchMock from 'jest-fetch-mock';
import { ArgumentError } from '../errors/argument-error';
import { MemoryTranslator } from './memory-translator';
import { TRANSLATIONS_LOADED } from './translator';

describe('MemoryTranslator', () => {

  let service: MemoryTranslator;

  const mockResponse = JSON.stringify({
    'foo': {
      'foo': 'Foo',
      'bar': 'Bar',
    },
  });

  beforeEach(async () => {

    fetchMock.resetMocks();

    fetchMock.mockResponse(mockResponse);

    service = new MemoryTranslator('en-GB');

  });

  afterEach(() => {

    fetchMock.resetMocks();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('translate', () => {

    it('Should return an existing key in an existing locale.', () => {

      const value = service.translate('foo.foo');

      expect(value).toEqual('Foo');

    });

    it('Should translate by using the default locale when no locale was given.', () => {

      const value = service.translate('foo.bar');

      expect(value).toEqual('Bar');

    });

    it('Should return the input key with an non-existing key in an existing locale.', () => {

      const value = service.translate('lorem');

      expect(value).toEqual('[lorem]');

    });

    it('Should throw error when key is null.', () => {

      expect(()=>service.translate(null)).toThrow(ArgumentError);

    });

  });

  describe('setLang', () => {

    const newLang = 'en-US';

    it('should not set new language when invalid JSON', async () => {

      fetchMock.mockIf(/en-US/, '<not-json>');
      fetchMock.mockIf(/en-GB/, mockResponse);

      await service.setLang(newLang);
      expect(service.lang).not.toEqual(newLang);

    });

    it('should not set new language when fetch throws error', async () => {

      fetchMock.mockResponse(async (req) => {

        if (req.url.includes('en-US')) {

          throw new Error();

        } else {

          return mockResponse;

        }

      });

      await service.setLang(newLang);
      expect(service.lang).not.toEqual(newLang);

    });

    it('should set new language correctly', async () => {

      await service.setLang('nl-BE');
      expect(service.getLang()).toEqual('nl-BE');

    });

    it('should fire event when done', () => new Promise((done) => {

      service.addEventListener(TRANSLATIONS_LOADED, () => {

        done(true);

      });

      service.setLang('nl-BE');

    }));

  });

  describe('getLang', () => {

    it('should return the current language', async () => {

      expect(service.getLang()).toEqual(service.lang);

    });

  });

});
