import { ObjectEvent } from './object.events';
import { ObjectContext } from './object.machine';
import { loadNotifications } from './object.services';

describe('objectServices', () => {

  describe('loadNotifications', () => {

    it('should cover', async () => {

      await expect(loadNotifications({} as ObjectContext, {} as ObjectEvent)).resolves.toBeDefined();

    });

  });

});
