import { define } from '@digita-ai/dgt-components';
import { Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectUpdate } from '../models/object-update.model';
import { ClickedImportUpdates } from '../object.events';
import { ObjectUpdatesOverviewComponent } from './object-updates-overview.component';

describe('ObjectUpdatesOverviewComponent', () => {

  let component: ObjectUpdatesOverviewComponent;
  const tag = 'object-updates-overview';
  const mockTranslator: Translator = { translate: (input: string) => input } as any;

  const mockNotification: ObjectUpdate = {
    uri: 'https://uri.uri', from: 'https://from.uri', to: 'https://to.uri',
    originalObject: 'https://original.obj', updatedObject: 'https://updatesObj',
  };

  beforeEach(() => {

    define(tag, ObjectUpdatesOverviewComponent);
    component = document.createElement(tag) as ObjectUpdatesOverviewComponent;
    component.translator = mockTranslator;
    component.notifications = [ mockNotification, mockNotification, mockNotification ];

    (component.actor as any) = {
      send: jest.fn(),
    };

  });

  describe('HTML', () => {

    beforeEach(async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

    });

    it('should show an nde-large-card for every notification present', async () => {

      expect(component.shadowRoot.querySelectorAll('nde-large-card')).toHaveLength(component.notifications.length);

    });

    it('should call functions when accept or reject is clicked is clicked', async () => {

      component.onChangesAccepted = jest.fn();
      component.onChangesRejected = jest.fn();

      let button: HTMLElement = component.shadowRoot.querySelector('div.accept');
      expect(button).toBeDefined();
      button.click();
      button = component.shadowRoot.querySelector('div.reject');
      expect(button).toBeDefined();
      button.click();

      expect(component.onChangesAccepted).toHaveBeenCalledTimes(1);
      expect(component.onChangesRejected).toHaveBeenCalledTimes(1);

    });

    describe('onChangesAccepted', () => {

      it('should send ClickedImportUpdates event', async () => {

        component.onChangesAccepted('https://collection.uri/');
        expect(component.actor.send).toHaveBeenCalledWith(new ClickedImportUpdates('https://collection.uri/'));

      });

    });

  });

});
