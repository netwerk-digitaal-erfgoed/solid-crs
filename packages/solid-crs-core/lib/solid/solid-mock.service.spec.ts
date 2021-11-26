/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentError } from '../errors/argument-error';
import { ConsoleLogger } from '../logging/console-logger';
import { SolidMockService } from './solid-mock.service';

describe('SolidMockService', () => {

  let service: SolidMockService;

  beforeEach(() => {

    service = new SolidMockService(new ConsoleLogger(6, 6));

  });

  describe('getIssuer()', () => {

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

  describe('getSession()', () => {

    it('should throw when profiles is undefined', async () => {

      (service as any).profiles = undefined;
      await expect(service.getSession()).rejects.toThrow(ArgumentError);

    });

    it('should return undefined', async () => {

      await expect(service.getSession()).resolves.toEqual(undefined);

    });

  });

  describe('login()', () => {

    it('should throw when webId is undefined', async () => {

      await expect(service.login(undefined)).rejects.toThrow(ArgumentError);

    });

    it('should throw when issuer is undefined', async () => {

      (service as any).profiles = [ { webId: 'https://test.com', issuer: undefined } ];
      service.getIssuer = jest.fn().mockReturnValueOnce(false);
      await expect(service.login('https://test.com')).rejects.toThrow(ArgumentError);

    });

    it('should not throw when issuer is defined', async () => {

      (service as any).profiles = [ { webId: 'https://test.com', issuer: 'test' } ];
      await expect(service.login('https://test.com')).resolves.toBeUndefined();

    });

  });

  describe('logout()', () => {

    it('should log', async () => {

      // eslint-disable-next-line @typescript-eslint/dot-notation
      (service['logger'].debug as any) = jest.fn();

      await service.logout();

      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service['logger'].debug).toHaveBeenCalled();

    });

  });

  describe('getProfile()', () => {

    it('should throw when webId is undefined', async () => {

      await expect(service.getProfile(undefined)).rejects.toThrow(ArgumentError);

    });

    it('should return a mock profile', async () => {

      const uri = 'uri';
      await expect(service.getProfile(uri)).resolves.toEqual(expect.objectContaining({ uri }));

    });

  });

});
