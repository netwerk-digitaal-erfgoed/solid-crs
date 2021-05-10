import { Alert } from '@digita-ai/nde-erfgoed-components';
import { ArgumentError, Collection, ConsoleLogger, LoggerLevel, MemoryStore, CollectionObjectMemoryStore } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from './app.events';
import { AppAuthenticateStates, AppContext, appMachine, AppRootStates } from './app.machine';
import { AppRootComponent } from './app-root.component';
import { SolidMockService } from './common/solid/solid-mock.service';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

describe('AppRootComponent', () => {

  let component: AppRootComponent;
  let machine: Interpreter<AppContext>;

  beforeEach(() => {

    machine = interpret(appMachine(solid,
      new MemoryStore<Collection>([
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
      ])));

    machine.start();
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

    window.document.body.appendChild(component);
    await component.updateComplete;

    component.dismiss({ detail: alert } as CustomEvent<Alert>);

  });

  it('should throw error when dismissing without event', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(() => component.dismiss(null)).toThrow(ArgumentError);
    expect(() => component.dismiss({ detail: null } as CustomEvent<Alert>)).toThrow(ArgumentError);

  });

});
