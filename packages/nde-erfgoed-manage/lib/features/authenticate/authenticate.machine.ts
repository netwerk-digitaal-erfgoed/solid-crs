import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { MachineConfig, StateNodeConfig } from 'xstate';
import { AuthenticateContext } from './authenticate.context';
import { AuthenticateEvent, AuthenticateEvents } from './authenticate.events';
import { AuthenticateSchema, AuthenticateStates } from './authenticate.states';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

/**
 * Actor references for this machine config.
 */
export enum AuthenticateActors {
  AUTHENTICATE_MACHINE = 'AuthenticateMachine',
}

/**
 * The machine config for the collection component machine.
 */
export const authenticateConfig: StateNodeConfig<AuthenticateContext, AuthenticateSchema, AuthenticateEvent> = {
  id: 'authenticate',
  initial: AuthenticateStates.UNAUTHENTICATED,
  context: {
    session: {}, // new Session()
  },
  states: {

    [AuthenticateStates.UNAUTHENTICATED]: {
      invoke: {
        src: null, // handleincomingredirect
        onDone: AuthenticateEvents.LOGIN_SUCCESS,
        onError: AuthenticateEvents.LOGIN_ERROR,
      },
      on: {
        [AuthenticateEvents.CLICKED_LOGIN]: AuthenticateStates.AUTHENTICATING,
        [AuthenticateEvents.SESSION_RESTORED]: AuthenticateStates.AUTHENTICATED,
      },
    },

    [AuthenticateStates.AUTHENTICATING]: {
      invoke: {
        src: null, // login()
        onDone: AuthenticateEvents.LOGIN_SUCCESS,
        onError: AuthenticateEvents.LOGIN_ERROR,
      },
      on: {
        [AuthenticateEvents.LOGIN_SUCCESS]: AuthenticateStates.AUTHENTICATED,
        [AuthenticateEvents.LOGIN_ERROR]: AuthenticateStates.UNAUTHENTICATED,
      },
    },

    [AuthenticateStates.AUTHENTICATED]: {
      on: {
        [AuthenticateEvents.CLICKED_LOGOUT]: AuthenticateStates.UNAUTHENTICATED,
      },
    },
  },
};
