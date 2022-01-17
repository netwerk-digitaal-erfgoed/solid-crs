/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObjectMemoryStore, CollectionObject, Collection, CollectionMemoryStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AddAlertEvent, AppEvents, ClickedAdministratorTypeEvent, DismissAlertEvent, LoggedInEvent, SetProfileEvent } from './app.events';
import { AppContext, AppDataStates, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import { CollectionEvents } from './features/collection/collection.events';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';

const solidService = {
  getProfile: jest.fn(async () => ({
    uri: 'https://example.com/profile',
  })),
  logout: jest.fn(async() => undefined),
  getStorages: jest.fn(async () => [ 'https://storage.uri/' ]),
} as any;

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
        solidService,
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
        collection1,
        object1
      )
        .withContext({
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
        solidService,
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
        collection1,
        object1
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

  it('should dismiss alert in context when sending DismissAlertEvent', () => {

    const alert: Alert = { type: 'success', message: 'foo' };

    const machineWithAlerts = interpret<AppContext>(
      appMachine(
        solidService,
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
        collection1,
        object1
      ).withContext({
        alerts: [ alert ],
      }),
    );

    machineWithAlerts.start();

    const first = true;

    machineWithAlerts.onChange((context) => {

      if (first) {

        expect(context.alerts.length).toBe(1);
        machineWithAlerts.send(new DismissAlertEvent(alert));

      } else {

        expect(context.alerts.length).toBe(0);

      }

    });

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

  it('should assign session when logged in', (done) => {

    machine.onChange((context) => {

      if(context.session?.webId === 'lorem') {

        done();
        machine.stop();

      }

    });

    machine.start();

    machine.send({ type: AppEvents.LOGGED_IN, session: { webId: 'lorem' } } as LoggedInEvent);

  });

  it('should remove session when logged out', (done) => {

    const alert: Alert = { type: 'success', message: 'foo' };

    machine = interpret<AppContext>(
      appMachine(
        solidService,
        new CollectionMemoryStore([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([ object1 ]),
        collection1,
        object1
      )
        .withContext({
          alerts: [ alert ],
          session: { webId: 'lorem' },
        }),
    );

    machine.onChange((context) => {

      if(!context.session) {

        done();
        machine.stop();

      }

    });

    machine.start();

    machine.send(AppEvents.LOGGED_IN, { session: { webId: 'foo' } });
    machine.send(AppEvents.CLICKED_LOGOUT);

  });

  it('should emit selected collection after login', (done) => {

    machine.onEvent((event) => {

      if(event.type === CollectionEvents.SELECTED_COLLECTION) {

        done();

      }

    });

    machine.start();

    machine.send(AppEvents.LOGGED_IN, { session: { webId: 'foo' } });

  });

  it('should transition to SEARCH when SEARCH_UPDATED is fired', (done) => {

    machine.onTransition((state) => {

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.COLLECTION })) {

        machine.send({ type: SearchEvents.SEARCH_UPDATED, searchTerm: 'test' } as SearchUpdatedEvent);

      }

      if(state.matches({ [AppRootStates.FEATURE]: AppFeatureStates.SEARCH })) {

        done();
        machine.stop();

      }

    });

    machine.start();

    machine.send(AppEvents.LOGGED_IN, { session: { webId: 'foo' } });

  });

  it('should add alert when ClickedAdministratorType is fired', (done) => {

    machine = interpret<AppContext>(
      appMachine(solidService,
        {
          search: jest.fn(),
          all: jest.fn(),
          delete: jest.fn(),
          save: jest.fn(),
          get: jest.fn(),
          getInstanceForClass: jest.fn(() => null),
        },
        new CollectionObjectMemoryStore([ object1 ]),
        collection1,
        object1).withContext({
        alerts: [],
      }),
    );

    let clicked = false;

    machine.onTransition((state) => {

      if(!clicked && state.matches({ [AppRootStates.DATA]: AppDataStates.IDLE })) {

        clicked = true;
        machine.send(new SetProfileEvent());

      }

      if(state.matches({ [AppRootStates.DATA]: AppDataStates.DETERMINING_POD_TYPE })) {

        machine.send(new ClickedAdministratorTypeEvent());

      }

      if(clicked && state.matches({ [AppRootStates.DATA]: AppDataStates.IDLE })) {

        done();
        machine.stop();

      }

    });

    machine.start();

  });

});
