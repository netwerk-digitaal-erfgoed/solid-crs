import { MockTranslator } from './mock-translator';

describe('MockTranslator', () => {

  let service: MockTranslator;

  beforeEach(async () => {

    service = new MockTranslator('en-GB');

  });

  it('should create', () => {

    service = new MockTranslator();
    expect(service).toBeTruthy();
    expect(service.lng).toEqual('nl-NL');

    service = new MockTranslator('en-GB');
    expect(service).toBeTruthy();
    expect(service.lng).toEqual('en-GB');

  });

  describe('translate', () => {

    it('should return key', () => {

      expect(service.translate('test.key')).toEqual('test.key');

    });

  });

  describe('getLng', () => {

    it('should return lng', () => {

      expect(service.getLng()).toEqual('en-GB');

    });

  });

  describe('setLng', () => {

    it('should set lng', async () => {

      await service.setLng('nl-NL');
      expect(service.lng).toEqual('nl-NL');

    });

  });

});
