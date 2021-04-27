import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { Event } from '@digita-ai/nde-erfgoed-components';
import { assign, createMachine, MachineConfig, StateNodeConfig } from 'xstate';
import { log } from 'xstate/lib/actions';
import { AuthenticateContext } from './authenticate.context';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateSchema, AuthenticateState, AuthenticateStates } from './authenticate.states';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

/**
 * Actor references for this machine config.
 */
export enum AuthenticateActors {
  AUTHENTICATE_MACHINE = 'AuthenticateMachine',
}

/**
 * The machine config for the authenticate machine.
 */
export const authenticateConfig: MachineConfig<AuthenticateContext, any, Event<AuthenticateEvents>> = {
  id: 'authenticate',
  initial: AuthenticateStates.UNAUTHENTICATED,
  context: {
    session: {}, // new Session()
  },
  states: {

    [AuthenticateStates.UNAUTHENTICATED]: {
      entry: [
        assign({ session: null }),
        log('entered unauthenticated state'),
      ],
      invoke: {
        src: () => solid.handleIncomingRedirect(), // handleincomingredirect
        // onDone: {
        //   target: AuthenticateStates.AUTHENTICATED,
        // },
      },
      // on: {
      //   [AuthenticateEvents.CLICKED_LOGIN]: AuthenticateStates.AUTHENTICATING,
      //   [AuthenticateEvents.SESSION_RESTORED]: AuthenticateStates.AUTHENTICATED,
      // },
    },

    [AuthenticateStates.AUTHENTICATING]: {
      entry: log('entered authenticating state'),
      invoke: {
        src: () => solid.login(), // login()
        onDone: AuthenticateStates.AUTHENTICATED,
        // onError: AuthenticateStates.UNAUTHENTICATED,
      },
      on: {
        [AuthenticateEvents.LOGIN_SUCCESS]: AuthenticateStates.AUTHENTICATED,
        [AuthenticateEvents.LOGIN_ERROR]: AuthenticateStates.UNAUTHENTICATED,
      },
    },

    [AuthenticateStates.AUTHENTICATED]: {
      entry: log('entered authenticated state'),
      type: 'final',
      on: {
        [AuthenticateEvents.CLICKED_LOGOUT]: AuthenticateStates.UNAUTHENTICATED,
      },
    },
  },
};

/**
 * The authenticate machine.
 */
export const authenticateMachine = createMachine<AuthenticateContext, Event<AuthenticateEvents>, AuthenticateState>(authenticateConfig);
