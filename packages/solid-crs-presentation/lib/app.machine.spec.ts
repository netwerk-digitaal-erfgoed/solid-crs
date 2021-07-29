import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObjectMemoryStore, CollectionObject, Collection, CollectionMemoryStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AddAlertEvent, AppEvents, DismissAlertEvent } from './app.events';
import { AppContext, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import { CollectionEvents } from './features/collection/collection.events';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';

describe('AppMachine', () => {

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
    subject: null,
    type: null,
    updated: '0',
    collection: 'collection-uri-1',
  };

  let machine: Interpreter<AppContext>;

  beforeEach(() => {

    machine = interpret(
      appMachine(
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
      ).withContext({
        alerts: [],
      }),
    );

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should add alert to context when sending addAlert', () => {

    const alert = { type: 'success', message: 'foo' };
    machine.start();
    machine.send(AppEvents.ADD_ALERT, { alert });

    expect(machine.state.context.alerts).toBeTruthy();
    expect(machine.state.context.alerts.length).toBe(1);
    expect(machine.state.context.alerts[0]).toEqual(alert);

  });

  it('should not add duplicate alert to context when sending addAlert', () => {

    const alert: Alert = { type: 'success', message: 'foo' };

    machine = interpret<AppContext>(
      appMachine(
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
      )
        .withContext({
          alerts: [ alert ],
        }),
    );

    machine.start();
    machine.send(AppEvents.ADD_ALERT, { alert });

    expect(machine.state.context.alerts).toBeTruthy();
    expect(machine.state.context.alerts.length).toBe(1);
    expect(machine.state.context.alerts[0]).toEqual(alert);

  });

  it('should send error event when sending addAlert without payload', async (done) => {

    machine.start();

    machine.onEvent(((event) => {

      if(event.type === AppEvents.ERROR) {

        done();

      }

    }));

    machine.send(new AddAlertEvent(undefined));

  });

  it('should dismiss alert in context when sending dismissAlert', () => {

    const alert: Alert = { type: 'success', message: 'foo' };

    machine = interpret<AppContext>(
      appMachine(
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
      )
        .withContext({
          alerts: [ alert ],
        }),
    );

    machine.start();
    expect(machine.state.context.alerts.length).toBe(1);
    machine.send(new DismissAlertEvent(alert));
    expect(machine.state.context.alerts.length).toBe(0);

  });

  it('should not dismiss non-existing alert in context when sending dismissAlert', () => {

    const alert: Alert = { type: 'success', message: 'foo' };
    machine.start();
    expect(machine.state.context.alerts.length).toBe(0);
    machine.send(new DismissAlertEvent(alert));
    expect(machine.state.context.alerts.length).toBe(0);

  });

  it('should send error event when sending dismissAlert without payload', async (done) => {

    machine.start();

    machine.onEvent(((event) => {

      if(event.type === AppEvents.ERROR) {

        done();

      }

    }));

    machine.send(new DismissAlertEvent(undefined));

  });

  it('should send add alert event when error event is sent', async (done) => {

    machine.start();

    machine.onEvent(((event) => {

      if(event.type === AppEvents.ADD_ALERT) {

        done();

      }

    }));

    machine.send(AppEvents.ERROR);

  });

  it('should start in collection feature', async (done) => {

    machine.onTransition((state) => {

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.COLLECTION })) {

        done();

      }

    });

    machine.start();

  });

  it('should transition to SEARCH when SEARCH_UPDATED is fired', (done) => {

    machine.onTransition((state) => {

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.COLLECTION })) {

        machine.send({ type: SearchEvents.SEARCH_UPDATED, searchTerm: 'test' } as SearchUpdatedEvent);

      }

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.SEARCH })) {

        done();

      }

    });

    machine.start();

  });

});
