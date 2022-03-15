/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { InboxService } from './inbox.service';

describe('InboxService', () => {

  let service: InboxService;

  const solidService: SolidSDKService = {
    getDefaultSession: () => ({
      info: {
        webId: 'https://web.id/profile/card#me',
      },
    }),
  } as any;

  beforeEach(() => {

    service = new InboxService(solidService);

  });

  it('should be defined', async () => {

    expect(service).toBeTruthy();

  });

});
