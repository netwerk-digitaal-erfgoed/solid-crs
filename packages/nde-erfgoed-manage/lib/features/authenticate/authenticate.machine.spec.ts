import { Schema, Event } from '@digita-ai/nde-erfgoed-components';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../app.machine';
import { AuthenticateContext } from './authenticate.context';
import { AuthenticateEvents } from './authenticate.events';

describe('AppMachine', () => {
  let machine: Interpreter<AuthenticateContext, Schema<AuthenticateContext, AuthenticateEvents>, Event<AuthenticateEvents>>;

  beforeEach(() => {
    machine = interpret<AuthenticateContext, any, Event<AuthenticateEvents>>(appMachine.withContext({}));
  });

  it('should be correctly instantiated', () => {
    expect(machine).toBeTruthy();
  });
});
