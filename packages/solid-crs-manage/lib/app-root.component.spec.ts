/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionObjectMemoryStore, CollectionObject, CollectionMemoryStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import fetchMock from 'jest-fetch-mock';
import { AppEvents, DismissAlertEvent, LoggedInEvent } from './app.events';
import { AppAuthenticateStates, AppContext, AppDataStates, appMachine, AppRootStates } from './app.machine';
import { AppRootComponent } from './app-root.component';

const solidService = {
  getProfile: jest.fn(async () => ({
    uri: 'https://example.com/profile',
  })),
  getSession: jest.fn(async () => ({
    info: {
      webId: 'https://example.com/profile',
    },
  })),
} as any;

describe('AppRootComponent', () => {

  let component: AppRootComponent;
  let machine: Interpreter<AppContext>;

  const collection1: Collection = {
    uri: 'collection-uri-3',
    name: 'Collection 3',
    description: 'This is collection 3',
    objectsUri: 'test-uri',
    distribution: 'test-uri',
  };

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

    machine = interpret(appMachine(solidService,
      new CollectionMemoryStore([
        collection2,
        collection3,
      ]),
      new CollectionObjectMemoryStore([
        object1,
      ]),
      collection1,
      object1)
      .withContext({
        alerts: [],
        session: { webId: 'lorem' },
      }));

    component = new AppRootComponent(solidService);

    component.actor = machine;

    fetchMock.mockResponseOnce(JSON.stringify({}));

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

        done();

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.send({ type: AppEvents.LOGGED_IN, session: { webId:'test' } } as LoggedInEvent);

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

  it('should send event when dismissing', () => {

    const alert: Alert = { message: 'foo', type: 'success' };

    machine.send = jest.fn();

    component.dismiss({ detail: alert } as CustomEvent<Alert>);

    expect(machine.send).toHaveBeenCalledWith(new DismissAlertEvent(alert));

  });

  it('should throw error when dismissing without event', async () => {

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
        })){

        done();

        await component.updateComplete;
        const sidebar = window.document.body.getElementsByTagName('nde-app-root')[0].shadowRoot.querySelector('nde-sidebar');
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

        machine.send({ type: AppEvents.LOGGED_IN, session: { webId: 'test' } } as LoggedInEvent);
        await component.updateComplete;

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    component.firstUpdated(undefined);
    await component.updateComplete;

  });

  it('should add collection when store contains none', async (done) => {

    // start without collection
    machine = interpret(appMachine(solidService,
      new CollectionMemoryStore([]),
      new CollectionObjectMemoryStore([]),
      collection1,
      object1).withContext({
      alerts: [],
      selected: collection1,
    }));

    machine.start();

    machine.onTransition(async (state) => {

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
        machine.send({ type: AppEvents.LOGGED_IN, session: { webId: 'test' } } as LoggedInEvent);
        await component.updateComplete;

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.send({ type: AppEvents.LOGGED_IN, session: { webId:'test' } } as LoggedInEvent);

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
