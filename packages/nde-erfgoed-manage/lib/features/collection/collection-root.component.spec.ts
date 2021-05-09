import { Alert } from '@digita-ai/nde-erfgoed-components';
import { ArgumentError, Collection, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, MemoryStore } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from '../../app.events';
import { appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { CollectionRootComponent } from './collection-root.component';
import { CollectionContext, collectionMachine } from './collection.machine';

describe('CollectionRootComponent', () => {

  let component: CollectionRootComponent;
  let machine: Interpreter<CollectionContext>;

  beforeEach(() => {

    const collectionStore = new MemoryStore<Collection>([
      {
        uri: 'collection-uri-1',
        name: 'Collection 1',
        description: 'This is collection 1',
      },
      {
        uri: 'collection-uri-2',
        name: 'Collection 2',
        description: 'This is collection 2',
      },
    ]);

    const objectStore = new CollectionObjectMemoryStore([
      {
        uri: 'object-uri-1',
        name: 'Object 1',
        description: 'This is object 1',
        image: null,
        subject: null,
        type: null,
        updated: 0,
        collection: 'collection-uri-1',
      },
    ]);

    machine = interpret(collectionMachine(collectionStore, objectStore)
      .withContext({
        collection: {
          uri: 'collection-uri-1',
          name: 'Collection 1',
          description: 'This is collection 1',
        },
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore
    ));

    component = window.document.createElement('nde-collection-root') as CollectionRootComponent;

    component.actor = machine;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show alerts when set', async () => {

    component.alerts = [ {
      type: 'success',
      message: 'Foo',
    } ];

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should not show alerts when unset', async () => {

    component.alerts = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  describe('handleDismiss', () => {

    const alert: Alert = { message: 'foo', type: 'success' };

    it('should throw error when event is null', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss(null)).toThrow(ArgumentError);

    });

    it('should throw error when actor is null', async () => {

      component.actor = null;

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss({ detail: alert } as CustomEvent<Alert>)).toThrow(ArgumentError);

    });

    it('should send dismiss alert event to parent', async (done) => {

      machine.parent.onEvent((event) => {

        if(event && event.type === AppEvents.DISMISS_ALERT) {

          expect(event.alert).toEqual(alert);
          done();

        }

      });

      machine.start();
      machine.parent.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);

    });

  });

});
