import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, MockTranslator, SolidMockService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents, DismissAlertEvent } from '../../app.events';
import { appMachine } from '../../app.machine';
import { CollectionRootComponent } from './collection-root.component';
import { CollectionContext, collectionMachine } from './collection.machine';

describe('CollectionRootComponent', () => {

  let component: CollectionRootComponent;
  let machine: Interpreter<CollectionContext>;
  let collectionStore: CollectionMemoryStore;
  let objectStore: CollectionObjectMemoryStore;

  const collection1: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: null,
    distribution: null,
  };

  const collection2: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: null,
    distribution: null,
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

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1 ]);

    machine = interpret(collectionMachine(objectStore)
      .withContext({
        collection: collection1,
        objects: [ object1 ],
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.error, LoggerLevel.error)),
      collectionStore,
      objectStore,
    ).withContext({
      alerts: [],
      selected: collection1,
    }));

    component = window.document.createElement('nde-collection-root') as CollectionRootComponent;

    component.actor = machine;

    component.translator = new MockTranslator('nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should not throw when running updated with null', () => {

    expect(() => component.updated(null)).not.toThrow();

  });

  it('should show alerts when set', async () => {

    component.alerts = [ {
      type: 'success',
      message: 'Foo',
    } ];

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should not show alerts when unset', async () => {

    component.alerts = null;

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should copy value to clipboard when onClickedCopy is fired', async () => {

    (navigator.clipboard as any) = {
      writeText: jest.fn(async() => undefined),
    };

    machine.parent.onEvent((event) => {

      if (event.type === AppEvents.ADD_ALERT) {

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

      }

    });

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.onClickedCopy('test');

  });

  describe('handleDismiss', () => {

    const alert: Alert = { message: 'foo', type: 'success' };

    it('should throw error when event is null', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss(null)).toThrow(ArgumentError);

    });

    it('should throw error when actor is null', async () => {

      component.actor = null;

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss({ detail: alert } as CustomEvent<Alert>)).toThrow(ArgumentError);

    });

    it('should send dismiss alert event to parent', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.parent.send = jest.fn();
      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);
      expect(machine.parent.send).toHaveBeenCalledWith(new DismissAlertEvent(alert));

    });

  });

  it('should update subscription when formActor is updated', async () => {

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    component.subscribe = jest.fn();

    const map = new Map<string, string>();
    map.set('actor', 'bla');
    map.set('formActor', 'bla');

    component.updated(map);

    expect(component.subscribe).toHaveBeenCalledTimes(4);

  });

});
