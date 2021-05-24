import { Alert } from '@netwerk-digitaal-erfgoed/solid-cbs-components';
import { ArgumentError, Collection, ConsoleLogger, LoggerLevel, MemoryStore, CollectionObjectMemoryStore } from '@netwerk-digitaal-erfgoed/solid-cbs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from './app.events';
import { AppAuthenticateStates, AppContext, AppDataStates, appMachine, AppRootStates } from './app.machine';
import { AppRootComponent } from './app-root.component';
import { SolidMockService } from './common/solid/solid-mock.service';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

describe('AppRootComponent', () => {

  let component: AppRootComponent;
  let machine: Interpreter<AppContext>;

  const template: Collection = {
    uri: 'collection-uri-3',
    name: 'Collection 3',
    description: 'This is collection 3',
    objectsUri: 'test-uri',
    distribution: 'test-uri',
  };

  beforeEach(() => {

    machine = interpret(appMachine(solid,
      new MemoryStore<Collection>([
        {
          uri: 'collection-uri-1',
          name: 'Collection 1',
          description: 'This is collection 1',
          objectsUri: 'test-uri',
          distribution: 'test-uri',
        },
        {
          uri: 'collection-uri-2',
          name: 'Collection 2',
          description: 'This is collection 2',
          objectsUri: 'test-uri',
          distribution: 'test-uri',
        },
      ]),
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
      ]),
      template)
      .withContext({
        alerts: [],
        session: { webId: 'lorem' },
      }));

    component = window.document.createElement('nde-app-root') as AppRootComponent;

    component.actor = machine;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show primary navigation when authenticated', async (done) => {

    machine.onTransition(async (state) => {

      if(state.matches({ [AppRootStates.AUTHENTICATE]: AppAuthenticateStates.AUTHENTICATED })){

        await component.updateComplete;
        const sidebar = window.document.body.getElementsByTagName('nde-app-root')[0].shadowRoot.querySelectorAll('nde-sidebar');

        expect(sidebar).toBeTruthy();
        expect(sidebar.length).toBe(1);

        done();

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.send({ type: AppEvents.LOGGED_IN, session: { webId:'test' } });

  });

  it('should not show primary navigation when unauthenticated', async (done) => {

    machine.onTransition(async (state) => {

      if(state.matches({ [AppRootStates.AUTHENTICATE]: AppAuthenticateStates.UNAUTHENTICATED })){

        await component.updateComplete;
        const sidebar = window.document.body.getElementsByTagName('nde-app-root')[0].shadowRoot.querySelectorAll('nde-sidebar');

        expect(sidebar.length).toBe(0);

        done();

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  it('should send event when dismissing', async (done) => {

    const alert: Alert = { message: 'foo', type: 'success' };

    machine.onEvent(async (event) => {

      if(event.type === AppEvents.DISMISS_ALERT && event){

        expect(event.alert).toEqual(alert);
        done();

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    component.dismiss({ detail: alert } as CustomEvent<Alert>);

  });

  it('should throw error when dismissing without event', async () => {

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(() => component.dismiss(null)).toThrow(ArgumentError);
    expect(() => component.dismiss({ detail: null } as CustomEvent<Alert>)).toThrow(ArgumentError);

  });

  it('should send create event when sidebar list action is clicked', async (done) => {

    machine.onTransition(async (state) => {

      if(
        state.matches({
          [AppRootStates.AUTHENTICATE]: AppAuthenticateStates.AUTHENTICATED,
          [AppRootStates.DATA]: AppDataStates.IDLE,
        })
      &&
        state.context?.collections?.length > 0){

        done();

        await component.updateComplete;
        const sidebar = window.document.body.getElementsByTagName('nde-app-root')[0].shadowRoot.querySelectorAll('nde-sidebar');
        expect(sidebar).toBeTruthy();

        const listItem = sidebar[0].querySelectorAll('nde-sidebar-list-item')[0];
        expect(listItem).toBeTruthy();

        const action = listItem.querySelector('div[slot="actions"]') as HTMLElement;
        expect(action).toBeTruthy();

        action.click();

      }

    });

    machine.onEvent((event) => {

      if(event.type === AppEvents.CLICKED_CREATE_COLLECTION){

        done();

      }

    });

    machine.onTransition(async (state) => {

      if(
        state.matches({
          [AppRootStates.AUTHENTICATE]: AppAuthenticateStates.UNAUTHENTICATED,
          [AppRootStates.DATA]: AppDataStates.IDLE,
        })) {

        done();
        machine.send({ type: AppEvents.LOGGED_IN, session: { webId: 'test' } });
        await component.updateComplete;

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  it('should add collection when store contains none', async (done) => {

    // start without collection
    machine = interpret(appMachine(solid,
      new MemoryStore<Collection>([]),
      new CollectionObjectMemoryStore([]),
      template));

    machine.start();
    component.actor = machine;

    machine.onTransition(async (state) => {

      await component.updateComplete;

      if(state.context?.collections?.length === 1){

        done();

      }

    });

    machine.onTransition(async (state) => {

      if(
        state.matches({
          [AppRootStates.AUTHENTICATE]: AppAuthenticateStates.UNAUTHENTICATED,
          [AppRootStates.DATA]: AppDataStates.IDLE,
        })) {

        done();
        machine.send({ type: AppEvents.LOGGED_IN, session: { webId: 'test' } });
        await component.updateComplete;

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

});
