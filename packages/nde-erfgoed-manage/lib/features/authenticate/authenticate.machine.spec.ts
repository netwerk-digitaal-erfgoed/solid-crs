import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AuthenticateContext, authenticateMachine } from './authenticate.machine';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

describe('AppMachine', () => {
  let machine: Interpreter<AuthenticateContext>;

  beforeEach(() => {
    machine = interpret<AuthenticateContext>(authenticateMachine(solid).withContext({}));
  });

  it('should be correctly instantiated', () => {
    expect(machine).toBeTruthy();
  });
});
