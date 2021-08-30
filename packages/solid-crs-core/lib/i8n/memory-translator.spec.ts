import { ArgumentError } from '../errors/argument-error';
import { MemoryTranslator } from './memory-translator';

describe('MemoryTranslator', () => {

  let service: MemoryTranslator;

  beforeEach(async () => {

    service = new MemoryTranslator({
      'foo': {
        'foo': 'Foo',
        'bar': 'Bar',
      },

    },
    'en-GB');

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('translate', () => {

    it('Should return an existing key in an existing locale.', () => {

      const value = service.translate('foo.foo', 'en-GB');

      expect(value).toEqual('Foo');

    });

    it('Should translate by using the default locale when no locale was given.', () => {

      const value = service.translate('foo.bar');

      expect(value).toEqual('Bar');

    });

    it('Should return the input key with an existing key in an non-existing locale.', () => {

      const value = service.translate('foo.bar', 'nl-NL');

      expect(value).toEqual('foo.bar');

    });

    it('Should return the input key with an non-existing key in an existing locale.', () => {

      const value = service.translate('lorem', 'nl-NL');

      expect(value).toEqual('lorem');

    });

    it('Should throw error when key is null.', () => {

      expect(()=>service.translate(null, 'bla')).toThrow(ArgumentError);

    });

    it('Should throw error when locale and lng is null.', () => {

      service.lng = null;

      expect(()=>service.translate('bla', null)).toThrow(ArgumentError);

    });

  });

});
