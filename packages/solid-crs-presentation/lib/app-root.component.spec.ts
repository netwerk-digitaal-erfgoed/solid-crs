import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionObjectMemoryStore, CollectionObject, CollectionMemoryStore, MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { DismissAlertEvent } from './app.events';
import { AppContext, appMachine } from './app.machine';
import { AppRootComponent } from './app-root.component';
import fetchMock from 'jest-fetch-mock';

const solidService = {
  getProfile: jest.fn(async () => ({
    uri: 'https://example.com/profile',
  })),
  logout: jest.fn(async() => undefined),
} as any;

describe('AppRootComponent', () => {

  let component: AppRootComponent;
  let machine: Interpreter<AppContext>;

  const collection2: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: 'test-uri',
    distribution: 'test-uri',
  };

  const collection3: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: 'test-uri',
    distribution: 'test-uri',
  };

  const object1: CollectionObject = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: '0',
    collection: 'collection-uri-1',
  };

  beforeEach(() => {

    machine = interpret(appMachine(
      solidService,
      new CollectionMemoryStore([
        collection2,
        collection3,
      ]),
      new CollectionObjectMemoryStore([
        object1,
      ]))
      .withContext({
        alerts: [],
        session: { webId: 'lorem' },
      }));

    component = window.document.createElement('nde-app-root') as AppRootComponent;
    component.translator = new MockTranslator('nl-NL');
    component.actor = machine;

    fetchMock.mockIf('http://localhost/nl-NL.json', '{}');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show primary navigation', async () => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    const sidebar = window.document.body.getElementsByTagName('nde-app-root')[0].shadowRoot.querySelectorAll('nde-sidebar');

    expect(sidebar).toBeTruthy();
    expect(sidebar.length).toBe(1);

  });

  it('should send event when dismissing', () => {

    const alert: Alert = { message: 'foo', type: 'success' };

    machine.send = jest.fn();

    component.dismiss({ detail: alert } as CustomEvent<Alert>);

    expect(machine.send).toHaveBeenCalledWith(new DismissAlertEvent(alert));

  });

  it('should throw error when dismissing without event', async () => {

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(() => component.dismiss(null)).toThrow(ArgumentError);
    expect(() => component.dismiss({ detail: null } as CustomEvent<Alert>)).toThrow(ArgumentError);

  });

  describe('searchUpdated()', () => {

    it('should send FormUpdatedEvent when called', () => {

      machine.send = jest.fn();

      component.searchUpdated({ target: { value: 'test' } as HTMLInputElement } as any);

      expect(machine.send).toHaveBeenCalledWith(expect.objectContaining({ searchTerm: 'test' }));

    });

  });

  describe('clearSearchTerm()', () => {

    it('should send FormUpdatedEvent when called', () => {

      machine.send = jest.fn();

      component.clearSearchTerm();

      expect(machine.send).toHaveBeenCalledWith(expect.objectContaining({ searchTerm: '' }));

    });

  });

});
