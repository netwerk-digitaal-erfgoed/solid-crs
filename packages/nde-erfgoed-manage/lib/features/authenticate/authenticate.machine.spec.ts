import { Schema, Event } from '@digita-ai/nde-erfgoed-components';
import { interpret, Interpreter } from 'xstate';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext, authenticateMachine } from './authenticate.machine';

describe('AppMachine', () => {
  let machine: Interpreter<AuthenticateContext, Schema<AuthenticateContext, AuthenticateEvents>, Event<AuthenticateEvents>>;

  beforeEach(() => {
    machine = interpret<AuthenticateContext, any, Event<AuthenticateEvents>>(authenticateMachine.withContext({}));
  });

  it('should be correctly instantiated', () => {
    expect(machine).toBeTruthy();
  });
});
