import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObjectMemoryStore, CollectionObject, Collection, CollectionMemoryStore, ConsoleLogger, LoggerLevel, SolidMockService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AddAlertEvent, AppEvents, DismissAlertEvent } from './app.events';
import { AppContext, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';

global.window = Object.create(window);
const url = 'http://test.presentation.solid-crs/http%3A%2F%2Flocalhost%3A3000%2Fhetlageland%2Fprofile%2Fcard%23me/collection/http%3A%2F%2Flocalhost%3A3000%2Fhetlageland%2Fheritage-collections%2Fcatalog%23collection-1';
delete window.location;
(window.location as any) = new URL(url);

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
        new SolidMockService(new ConsoleLogger(LoggerLevel.error, LoggerLevel.error)),
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
        new SolidMockService(new ConsoleLogger(LoggerLevel.error, LoggerLevel.error)),
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

  it('should send error event when sending addAlert without payload', (done) => {

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
        new SolidMockService(new ConsoleLogger(LoggerLevel.error, LoggerLevel.error)),
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

  it('should send error event when sending dismissAlert without payload', (done) => {

    machine.start();

    machine.onEvent(((event) => {

      if(event.type === AppEvents.ERROR) {

        done();

      }

    }));

    machine.send(new DismissAlertEvent(undefined));

  });

  it('should send add alert event when error event is sent', (done) => {

    machine.start();

    machine.onEvent(((event) => {

      if(event.type === AppEvents.ADD_ALERT) {

        done();

      }

    }));

    machine.send(AppEvents.ERROR);

  });

  it('should start in initializing state', (done) => {

    machine.onTransition((state) => {

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.INIT })) {

        done();

      }

    });

    machine.start();

  });

  it('should transition to SEARCH when SEARCH_UPDATED is fired', (done) => {

    machine.onTransition((state) => {

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.INIT })) {

        machine.send({ type: SearchEvents.SEARCH_UPDATED, searchTerm: 'test' } as SearchUpdatedEvent);

      }

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.SEARCH })) {

        done();
        machine.stop();

      }

    });

    machine.start();

  });

});
