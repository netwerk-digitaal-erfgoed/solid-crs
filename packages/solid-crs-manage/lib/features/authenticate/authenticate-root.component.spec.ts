import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents, DismissAlertEvent } from '../../app.events';
import { appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { SolidService } from '../../common/solid/solid.service';
import { AuthenticateRootComponent } from './authenticate-root.component';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext, authenticateMachine } from './authenticate.machine';

describe('AuthenticateRootComponent', () => {

  let component: AuthenticateRootComponent;
  let machine: Interpreter<AuthenticateContext>;
  let solid: SolidService;

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

    const collectionStore = new CollectionMemoryStore([
      collection1,
      collection2,
    ]);

    const objectStore = new CollectionObjectMemoryStore([
      object1,
    ]);

    solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    machine = interpret(authenticateMachine(solid));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      collection1,
      object1
    ));

    component = window.document.createElement('nde-authenticate-root') as AuthenticateRootComponent;

    component.actor = machine;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show alerts when set', async () => {

    machine.start();

    component.alerts = [ {
      type: 'success',
      message: 'Foo',
    } ];

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(1);

  });

  it('should not show alerts when unset', async () => {

    machine.start();

    component.alerts = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it.each([ true, false ])('should disable button when can not submit', async (canSubmit) => {

    machine.start();

    component.canSubmit = canSubmit;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const button = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelector<HTMLButtonElement>('button[slot="action"]');

    expect(button.disabled).toBe(!canSubmit);

  });

  it.each([ true, false ])('should disable button when is submitting', async (isSubmitting) => {

    machine.start();

    component.canSubmit = true;
    component.isSubmitting = isSubmitting;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const button = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelector<HTMLButtonElement>('button[slot="action"]');

    expect(button.disabled).toBe(isSubmitting);

  });

  it.each([
    [ false, false, true ],
    [ true, false, false ],
    [ false, true, false ],
    [ true, true, false ],
  ])('should not show form when initializing or redirecting', async (isInitializing, isRedirecting, showForm) => {

    machine.start();

    component.isInitializing = isInitializing;
    component.isRedirecting = isRedirecting;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const form = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelectorAll('.form-container');

    expect(form.length > 0).toBe(showForm);

  });

  it.each([
    [ null, AuthenticateEvents.LOGIN_ERROR ],
    [ { webId:'foo' }, AuthenticateEvents.LOGIN_SUCCESS ],
  ])('should dispatch events after getting session', async (session, eventType, done) => {

    solid.getSession = jest.fn().mockResolvedValue(session);

    machine.onEvent((event) => {

      if(event.type === eventType) {

        done();

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

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

          const casted = event as DismissAlertEvent;

          expect(casted.alert).toEqual(alert);
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
