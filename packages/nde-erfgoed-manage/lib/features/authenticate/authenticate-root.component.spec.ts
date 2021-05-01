import { FormActors } from '@digita-ai/nde-erfgoed-components';
import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AuthenticateRootComponent } from './authenticate-root.component';
import { AuthenticateContext, authenticateMachine } from './authenticate.machine';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

describe('AuthenticateRootComponent', () => {
  let component: AuthenticateRootComponent;
  let machine: Interpreter<AuthenticateContext>;

  beforeEach(() => {
    machine = interpret(authenticateMachine(solid));
    machine.start();
    component = window.document.createElement('nde-authenticate-root') as AuthenticateRootComponent;

    component.actor = machine;
    component.formActor = machine.children.get(FormActors.FORM_MACHINE);
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

    const alerts = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(1);
  });

  it('should not show alerts when unset', async () => {
    component.alerts = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);
  });

  it.each([ true, false ])('should disable button when can not submit', async (canSubmit) => {
    component.canSubmit = canSubmit;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const button = window.document.body.getElementsByTagName('nde-authenticate-root')[0].shadowRoot.querySelector('button[slot="action"]');

    expect(button.disabled).toBe(!canSubmit);
  });

});
