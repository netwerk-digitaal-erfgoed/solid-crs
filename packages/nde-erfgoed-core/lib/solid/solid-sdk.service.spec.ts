// import * as solid from '@inrupt/solid-client-authn-browser';
// import { of } from 'rxjs';
// import { ConsoleLogger } from '../logging/console-logger';
// import { LoggerLevel } from '../logging/logger-level';
// import { SolidSdkService } from './solid-sdk.service';
// jest.mock('@inrupt/solid-client-authn-browser');

// describe('SolidService', () => {
//   let service: SolidService;

//   beforeEach(async () => {
//     const logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);
//     service = new SolidSdkService(logger);
//   });

//   afterEach(() => {
//     // clear spies
//     jest.clearAllMocks();
//   });

//   it('should be correctly instantiated', () => {
//     expect(service).toBeTruthy();
//   });

//   describe('login()', () => {

//     it.each([ null, undefined ])('should error when WebID is %s', async () => {
//       await expect(service.login(null)
//         .toPromise()).rejects.toThrow('invalid-webid.no-webid');
//     });

//     it('should error when WebID is an invalid URL', async () => {
//       await expect(service.login('a')
//         .toPromise()).rejects.toThrow('invalid-webid.invalid-url');
//     });

//     it('should error when WebID does not contain profile', async () => {
//       await expect(service.login('https://google.com/')
//         .toPromise()).rejects.toThrow('invalid-webid.no-profile');
//     });

//     it('should error when WebID does not contain oidcIssuer triple', async () => {
//       await expect(service.login('https://pod.inrupt.com/digitatestpod/settings/publicTypeIndex.ttl')
//         .toPromise()).rejects.toThrow('invalid-webid.no-oidc-issuer');
//     });

//     it('should error when WebID does not contain valid oidcIssuer value', async () => {
//       (service as any).validateOidcIssuer = jest.fn().mockImplementationOnce(() => of(false));
//       await expect(service.login('https://pod.inrupt.com/digitatestpod/profile/card#me')
//         .toPromise()).rejects.toThrow('invalid-webid.invalid-oidc-issuer');
//     });

//     it('should call login when WebID is valid', async () => {
//       const loginSpy = jest.spyOn(solid, 'login');
//       // assuming webid is valid
//       (service as any).validateWebId = jest.fn().mockImplementationOnce(() => of('https://broker.pod.inrupt.com/'));
//       await service.login('webId').toPromise();
//       expect(loginSpy).toHaveBeenCalledTimes(1);
//     });
//   });
// });
