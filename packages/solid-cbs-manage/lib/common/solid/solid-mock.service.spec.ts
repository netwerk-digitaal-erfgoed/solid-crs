import { ArgumentError, ConsoleLogger } from '@netwerk-digitaal-erfgoed/solid-cbs-core';
import { SolidMockService } from './solid-mock.service';

describe('SolidMockService', () => {

  let service: SolidMockService;

  beforeEach(() => {

    service = new SolidMockService(new ConsoleLogger(6, 6));

  });

  describe('getIssuer', () => {

    it('should throw when webid is undefined', async () => {

      await expect(service.getIssuer(undefined)).rejects.toThrow(ArgumentError);

    });

    it('should throw when profiles is undefined', async () => {

      (service as any).profiles = undefined;
      await expect(service.getIssuer('https://webid.com')).rejects.toThrow(ArgumentError);

    });

    it('should throw when webid is not a valid URL', async () => {

      await expect(service.getIssuer('notAurl')).rejects.toThrow(ArgumentError);

    });

    it('should throw when there is no issuer for a webid', async () => {

      (service as any).profiles = [ { webId: 'https://test.com', issuer: undefined } ];
      await expect(service.getIssuer('https://test.com')).rejects.toThrow(ArgumentError);

    });

  });

  describe('getSession', () => {

    it('should throw when profiles is undefined', async () => {

      (service as any).profiles = undefined;
      await expect(service.getSession()).rejects.toThrow(ArgumentError);

    });

  });

  describe('login', () => {

    it('should throw when webId is undefined', async () => {

      await expect(service.login(undefined)).rejects.toThrow(ArgumentError);

    });

    it('should throw when issuer is undefined', async () => {

      (service as any).profiles = [ { webId: 'https://test.com', issuer: undefined } ];
      await expect(service.login('https://test.com')).rejects.toThrow(ArgumentError);

    });

    it('should not throw when issuer is defined', async () => {

      (service as any).profiles = [ { webId: 'https://test.com', issuer: 'test' } ];
      await expect(service.login('https://test.com')).resolves.toBeUndefined();

    });

  });

});
