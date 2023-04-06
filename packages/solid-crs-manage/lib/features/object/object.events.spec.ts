import { ClickedObjectUpdatesOverview, SelectedTermsEvent } from './object.events';

describe('Object events', () => {

  describe('SelectedTermsEvent', () => {

    it('should instantiate', async () => {

      expect(new SelectedTermsEvent('field', [ { uri: 'uri', name: 'name' } ])).toBeTruthy();

    });

  });

  describe('ClickedObjectUpdatesOverview', () => {

    expect(new ClickedObjectUpdatesOverview()).toBeTruthy();

  });

});
