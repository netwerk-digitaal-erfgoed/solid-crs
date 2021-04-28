import { Schema, Event } from '@digita-ai/nde-erfgoed-components';
import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext, authenticateMachine } from './authenticate.machine';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

describe('AppMachine', () => {
  let machine: Interpreter<AuthenticateContext, Schema<AuthenticateContext, AuthenticateEvents>, Event<AuthenticateEvents>>;

  beforeEach(() => {
    machine = interpret<AuthenticateContext, any, Event<AuthenticateEvents>>(authenticateMachine(solid).withContext({}));
  });

  it('should be correctly instantiated', () => {
    expect(machine).toBeTruthy();
  });
});
