import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import * as solidCrsClient from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { mockObject1, mockCollection1, mockCollection2 } from '../../../tests/test-data';
import { ObjectRootComponent } from './object-root.component';
import { ObjectStates } from './object.machine';

URL.createObjectURL = jest.fn(() => 'https://mock.url/');

describe('ObjectRootComponent', () => {

  let component: ObjectRootComponent;

  beforeEach(async () => {

    const mockActor = new Promise((resolve) => resolve({
      send: jest.fn(),
      context: {
        collections: [ mockCollection1, mockCollection2 ],
        object: mockObject1,
      },
      matches: jest.fn((state) => state === ObjectStates.OVERVIEW),
    })) as any;

    component = window.document.createElement('nde-object-root') as ObjectRootComponent;
    component.translator = new MockTranslator('nl-NL');
    component.actor = mockActor;
    await component.updated(new Map().set('actor', mockActor));

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';
    jest.restoreAllMocks();
    component = undefined;

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should not throw when running updated with null', () => {

    expect(() => component.updated(null)).not.toThrow();

  });

  describe('onClickedCopy', () => {

    it('should copy value to clipboard when onClickedCopy is fired', async () => {

      (navigator.clipboard as any) = {
        writeText: jest.fn(async() => undefined),
      };

      component.onClickedCopy('test');
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');

    });

  });

  describe('handleDismiss', () => {

    it('should dispatch a CustomEvent', async () => {

      component.dispatchEvent = jest.fn();
      const expectedEvent = new CustomEvent<Alert>('dismiss', { detail: { message: 't', type: 'warning' } });
      component.handleDismiss(expectedEvent);
      expect(component.dispatchEvent).toHaveBeenCalledWith(expectedEvent);

    });

  });

  describe('onCollectionSelected', () => {

    it('should dispatch a CustomEvent', async () => {

      component.dispatchEvent = jest.fn();
      const expectedEvent = new CustomEvent<Collection>('selected-collection', { detail: mockCollection1 });
      component.onCollectionSelected(expectedEvent);
      expect(component.dispatchEvent).toHaveBeenCalledWith(expectedEvent);

    });

  });

  describe('downloadRDF', () => {

    it('should run the appropriate code', async () => {

      const spy = jest.spyOn(solidCrsClient, 'fetch');
      const result = component.downloadRDF();
      await expect(result).resolves.toBeUndefined;
      expect(spy).toHaveBeenCalled();

    });

  });

  describe('HTML', () => {

    it('should show alerts when set', async () => {

      component.alerts = [ { type: 'success', message: 'Foo' } ];
      window.document.body.appendChild(component);
      await component.updateComplete;
      const alerts = component.shadowRoot.querySelectorAll('nde-alert');

      expect(alerts).toBeTruthy();
      expect(alerts.length).toBe(1);

    });

    it('should not show alerts when unset', async () => {

      component.alerts = null;
      window.document.body.appendChild(component);
      await component.updateComplete;
      const alerts = component.shadowRoot.querySelectorAll('nde-alert');

      expect(alerts).toBeTruthy();
      expect(alerts.length).toBe(0);

    });

    it('should call toggleInfo and show menu when dots icon is clicked', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;
      component.infoPopup.hidden = true;

      const infoIcon = component.shadowRoot.querySelector<HTMLElement>('nde-content-header div[slot="actions"] div');
      infoIcon.click();
      expect(component.infoPopup.hidden).toEqual(false);

    });

    it('should call onCopyClicked when info menu item is clicked', async () => {

      (navigator.clipboard as any) = {
        writeText: jest.fn(async() => undefined),
      };

      component.onClickedCopy = jest.fn().mockResolvedValueOnce(void 0);
      window.document.body.appendChild(component);
      await component.updateComplete;
      component.infoPopup.hidden = false;

      const copyAnchor = component.shadowRoot.querySelector<HTMLElement>('nde-popup > div > a:last-of-type');
      copyAnchor.click();

      expect(component.onClickedCopy).toHaveBeenCalledTimes(1);

    });

  });

});
