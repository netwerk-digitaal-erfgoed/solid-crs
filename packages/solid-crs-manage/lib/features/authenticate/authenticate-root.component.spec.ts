/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, define, hydrate } from '@digita-ai/dgt-components';
import { SolidSDKService, ArgumentError, Collection, CollectionObject, CollectionObjectMemoryStore, CollectionSolidStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';

import { interpret, Interpreter } from 'xstate';
import { DismissAlertEvent } from '../../app.events';
import { AppContext, appMachine } from '../../app.machine';
import { AuthenticateRootComponent } from './authenticate-root.component';

describe('AuthenticateRootComponent', () => {

  let component: AuthenticateRootComponent;
  let machine: Interpreter<AppContext>;
  let solidService: SolidSDKService;
  let collectionStore: CollectionSolidStore;

  const collection1: Collection = {
    uri: 'collection-uri-3',
    name: 'Collection 3',
    description: 'This is collection 3',
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

    solidService = {
      getStorages: jest.fn(async () => [ 'https://storage.uri/' ]),
    } as any;

    collectionStore = {
      getInstanceForClass: jest.fn(async () => undefined),
    } as any;

    machine = interpret(appMachine(
      solidService,
      collectionStore,
      new CollectionObjectMemoryStore([
        object1,
      ]),
      collection1,
      object1
    )
      .withContext({
        alerts: [ { type: 'warning', message: 'test' } ],
        session: { webId: 'lorem' },
        profile: {
          name: 'Lea Peeters',
          uri: 'https://web.id/',
        },
      }));

    const tag = 'authenticate-component';
    define(tag, hydrate(AuthenticateRootComponent)(solidService));
    component = window.document.createElement(tag) as AuthenticateRootComponent;
    component.appActor = machine;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  describe('firstUpdated', () => {

    it('should subscribe to alerts', async () => {

      component.appActor.start();
      component.subscribe = jest.fn();

      const changed = new Map();
      changed.set('appActor', machine);
      component.firstUpdated(changed);

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.subscribe).toHaveBeenCalledWith('alerts', expect.anything());

    });

  });

  describe('handleDismiss', () => {

    const alert: Alert = { message: 'foo', type: 'success' };

    it('should throw error when event is null', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss(null)).toThrow(ArgumentError);

    });

    it('should throw error when actor is null', async () => {

      component.appActor = null;

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss({ detail: alert } as CustomEvent<Alert>)).toThrow(ArgumentError);

    });

    it('should send dismiss alert event to parent', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.send = jest.fn();

      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);
      expect(machine.send).toHaveBeenCalledWith(new DismissAlertEvent(alert));

    });

  });

});
