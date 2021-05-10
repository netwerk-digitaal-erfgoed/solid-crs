import { Alert } from '@digita-ai/nde-erfgoed-components';
import { Collection, ConsoleLogger, LoggerLevel, MemoryStore, CollectionObjectMemoryStore } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter, State } from 'xstate';
import { AppEvents, LoggedInEvent } from './app.events';
import { AppActors, AppContext, AppFeatureCollectionStates, AppFeatureStates, appMachine, AppRootStates, AppStates } from './app.machine';
import { SolidMockService } from './common/solid/solid-mock.service';
import { CollectionContext } from './features/collection/collection.machine';

describe('AppMachine', () => {

  const collection1 = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
  };

  const collection2 = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
  };

  let machine: Interpreter<AppContext>;

  beforeEach(() => {

    machine = interpret<AppContext>(
      appMachine(
        new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
        new MemoryStore<Collection>([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([
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
        ])
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

    machine = interpret<AppContext>(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      new MemoryStore<Collection>([ collection1, collection2 ]),
      new CollectionObjectMemoryStore([
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
      ])
    ).withContext({
      alerts: [ alert ],
    }));

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

    machine.send(AppEvents.ADD_ALERT, {});

  });

  it('should dismiss alert in context when sending dismissAlert', () => {

    const alert: Alert = { type: 'success', message: 'foo' };

    machine = interpret<AppContext>(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      new MemoryStore<Collection>([ collection1, collection2 ]),
      new CollectionObjectMemoryStore([
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
      ])
    )
      .withContext({
        alerts: [ alert ],
      }));

    machine.start();
    expect(machine.state.context.alerts.length).toBe(1);
    machine.send(AppEvents.DISMISS_ALERT, { alert });
    expect(machine.state.context.alerts.length).toBe(0);

  });

  it('should not dismiss non-existing alert in context when sending dismissAlert', () => {

    const alert: Alert = { type: 'success', message: 'foo' };
    machine.start();
    expect(machine.state.context.alerts.length).toBe(0);
    machine.send(AppEvents.DISMISS_ALERT, { alert });
    expect(machine.state.context.alerts.length).toBe(0);

  });

  it('should send error event when sending dismissAlert without payload', async (done) => {

    machine.start();

    machine.onEvent(((event) => {

      if(event.type === AppEvents.ERROR) {

        done();

      }

    }));

    machine.send(AppEvents.DISMISS_ALERT, {});

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

  it('should assign session when logged in', async (done) => {

    machine.onChange((context) => {

      if(context.session?.webId === 'lorem') {

        done();

      }

    });

    machine.start();

    machine.send({ type: AppEvents.LOGGED_IN, session: { webId: 'lorem' } } as LoggedInEvent);

  });

  it('should remove session when logged out', async (done) => {

    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

    machine = interpret<AppContext>(
      appMachine(solid,
        new MemoryStore<Collection>([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([
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
        ]))
        .withContext({
          alerts: [],
          session: { webId: 'lorem' },
        }),
    );

    machine.onChange((context) => {

      if(!context.session) {

        done();

      }

    });

    machine.start();

    machine.send({ type: AppEvents.LOGGING_OUT });

  });

  it('should send logged in when authenticate machine is done', async (done) => {

    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    solid.getSession = jest.fn(async () => ({ webId: 'lorem' }));

    machine = interpret<AppContext>(
      appMachine(solid,
        new MemoryStore<Collection>([ collection1, collection2 ]),
        new CollectionObjectMemoryStore([
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
        ]))
        .withContext({
          alerts: [],
        }),
    );

    machine.onEvent((event) => {

      if(event.type === AppEvents.LOGGED_IN && (event as LoggedInEvent).session?.webId === 'lorem') {

        done();

      }

    });

    machine.start();

  });

  it('should emit selected collection after login', async (done) => {

    machine.onEvent((event) => {

      if(event.type === AppEvents.SELECTED_COLLECTION) {

        done();

      }

    });

    machine.start();

    machine.send(AppEvents.LOGGED_IN, { session: { webId: 'foo' } });

  });

});
