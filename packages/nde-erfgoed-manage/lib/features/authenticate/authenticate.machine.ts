import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { Event, State } from '@digita-ai/nde-erfgoed-components';
import { assign, createMachine, MachineConfig, StateNodeConfig } from 'xstate';
import { log } from 'xstate/lib/actions';
import { map, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthenticateEvents } from './authenticate.events';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

/**
 * The context of th authenticate feature.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AuthenticateContext {

}

/**
 * Actor references for this machine config.
 */
export enum AuthenticateActors {
  AUTHENTICATE_MACHINE = 'AuthenticateMachine',
}

/**
 * State references for the collection component, with readable log format.
 */
export enum AuthenticateStates {
  AUTHENTICATED    = '[AuthenticateState: Authenticated]',
  AUTHENTICATING = '[AuthenticateState: Authenticating]',
  UNAUTHENTICATED  = '[AuthenticateState: Unauthenticated]',
}

/**
 * The authenticate machine.
 */
export const authenticateMachine = createMachine<AuthenticateContext, Event<AuthenticateEvents>, State<AuthenticateStates, AuthenticateContext>>({
  id: AuthenticateActors.AUTHENTICATE_MACHINE,
  initial: AuthenticateStates.UNAUTHENTICATED,
  states: {

    [AuthenticateStates.UNAUTHENTICATED]: {
      entry: [
        assign({ session: null }),
        log('entered unauthenticated state'),
      ],
      invoke: {
        src: () => solid.handleIncomingRedirect().pipe(
          switchMap(() => throwError(new Error())),
          map(() => ({ type: AuthenticateEvents.SESSION_RESTORED, webId: ''})),
        ),
        onDone: {
          target: AuthenticateStates.AUTHENTICATED,
        },
        onError: { actions: log('Could not restore session.')},
      },
      on: {
        [AuthenticateEvents.CLICKED_LOGIN]: AuthenticateStates.AUTHENTICATING,
        [AuthenticateEvents.SESSION_RESTORED]: AuthenticateStates.AUTHENTICATED,
      },
    },

    [AuthenticateStates.AUTHENTICATING]: {
      entry: log('entered authenticating state'),
      invoke: {
        src: () => solid.login().pipe(
          map(() => ({ type: AuthenticateEvents.SESSION_RESTORED, webId: ''})),
        ),
        onDone: AuthenticateStates.AUTHENTICATED,
        onError: AuthenticateStates.UNAUTHENTICATED,
      },
      on: {
        [AuthenticateEvents.LOGIN_SUCCESS]: AuthenticateStates.AUTHENTICATED,
        [AuthenticateEvents.LOGIN_ERROR]: AuthenticateStates.UNAUTHENTICATED,
      },
    },

    [AuthenticateStates.AUTHENTICATED]: {
      type: 'final',
      entry: log('entered authenticated state'),
    },
  },
});
