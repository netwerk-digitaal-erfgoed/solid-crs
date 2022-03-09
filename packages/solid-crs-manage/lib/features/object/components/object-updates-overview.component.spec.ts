import { define } from '@digita-ai/dgt-components';
import { Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectUpdate } from '../models/object-update.model';
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

  });

  describe('HTML', () => {

    beforeEach(async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

    });

    it('should show an nde-large-card for every notification present', async () => {

      expect(component.shadowRoot.querySelectorAll('nde-large-card')).toHaveLength(component.notifications.length);

    });

    it('should cover temporary code when accept or reject is clicked is clicked', async () => {

      let button: HTMLElement = component.shadowRoot.querySelector('.accept');
      expect(button).toBeDefined();
      button.click();
      button = component.shadowRoot.querySelector('.reject');
      expect(button).toBeDefined();
      button.click();

    });

  });

});
