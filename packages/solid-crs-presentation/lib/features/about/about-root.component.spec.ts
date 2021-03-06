import { Alert, LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, MockTranslator, SolidMockService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { DismissAlertEvent } from '../../app.events';
import { AppContext, appMachine } from '../../app.machine';
import { SelectedCollectionEvent } from '../collection/collection.events';
import { AboutRootComponent } from './about-root.component';

describe('AboutRootComponent', () => {

  let component: AboutRootComponent;
  let machine: Interpreter<AppContext>;

  const collection1: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: '',
    distribution: '',
  };

  const collection2: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: '',
    distribution: '',
  };

  const object1: CollectionObject = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    type: null,
    updated: '0',
    collection: 'collection-uri-1',
  };

  beforeEach(() => {

    machine = interpret(
      appMachine(
        new SolidMockService(new ConsoleLogger(LoggerLevel.error, LoggerLevel.error)),
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
      ).withContext({
        alerts: [],
      }),
    );

    component = window.document.createElement('nde-about-root') as AboutRootComponent;
    component.actor = machine;
    component.collections = [ collection1, collection2 ];
    component.translator = new MockTranslator('nl-NL');

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

    const alerts = window.document.body.getElementsByTagName('nde-about-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(1);

  });

  it('should not show alerts when unset', async () => {

    component.alerts = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-about-root')[0].shadowRoot.querySelectorAll('nde-alert');

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

    it('should send dismiss alert event to machine', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.send = jest.fn();
      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);
      expect(machine.send).toHaveBeenCalledWith(new DismissAlertEvent(alert));

    });

  });

  it('should send SelectedCollectionEvent when collection is clicked', async () => {

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const largeCard = window.document.body.getElementsByTagName('nde-about-root')[0].shadowRoot.querySelector<LargeCardComponent>('nde-large-card.collection');

    machine.send = jest.fn();
    largeCard.click();
    expect(machine.send).toHaveBeenCalledWith(new SelectedCollectionEvent(collection1));

  });

});
