import { ConsoleLogger, LoggerLevel } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { SolidService } from '../../common/solid/solid.service';
import { AuthenticateRootComponent } from './authenticate-root.component';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext, authenticateMachine } from './authenticate.machine';

describe('AuthenticateRootComponent', () => {

  let component: AuthenticateRootComponent;
  let machine: Interpreter<AuthenticateContext>;
  let solid: SolidService;

  beforeEach(() => {

    solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    machine = interpret(authenticateMachine(solid));

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

    const button = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelector('button[slot="action"]');

    expect(button.disabled).toBe(!canSubmit);

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

});
