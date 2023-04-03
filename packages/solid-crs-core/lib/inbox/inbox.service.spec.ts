/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolidSDKService } from '../solid/solid-sdk.service';
import { InboxService } from './inbox.service';

describe('InboxService', () => {

  let service: InboxService;

  const solidService: SolidSDKService = {
    getDefaultSession: () => ({
      info: {
        webId: 'https://web.id/profile/card#me',
      },
      fetch: async () => 'created',
    }),
  } as any;

  beforeEach(() => {

    service = new InboxService(solidService);

  });

  it('should be defined', async () => {

    expect(service).toBeTruthy();

  });

  describe('createInbox', () => {

    it('should error when containerUri is not a valid URI', async () => {

      await expect(service.createInbox('invalidurl')).rejects.toThrow('Invalid container URI');

    });

    it('should add slash top containerURI when not present', async () => {

      await expect(service.createInbox('https://container.uri')).resolves.toEqual('https://container.uri/inbox/');

    });

    it('should return inboxUri when successful', async () => {

      await expect(service.createInbox('https://container.uri/')).resolves.toEqual('https://container.uri/inbox/');

    });

  });

});
