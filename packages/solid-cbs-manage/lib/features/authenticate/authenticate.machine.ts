import { formMachine, State, FormActors, FormValidatorResult } from '@netwerk-digitaal-erfgoed/solid-cbs-components';
import { createMachine } from 'xstate';
import { send } from 'xstate/lib/actions';
import { catchError, map } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { SolidSession } from '../../common/solid/solid-session';
import { SolidService } from '../../common/solid/solid.service';
import { AuthenticateEvent, AuthenticateEvents, handleSessionUpdate } from './authenticate.events';

/**
 * The context of th authenticate feature.
 */
export interface AuthenticateContext {
  /**
   * Session of the current user.
   */
  session?: SolidSession;
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
  INITIAL    = '[AuthenticateState: Initial]',
  AUTHENTICATED    = '[AuthenticateState: Authenticated]',
  REDIRECTING = '[AuthenticateState: Redirecting]',
  UNAUTHENTICATED  = '[AuthenticateState: Unauthenticated]',
}

/**
 * The authenticate machine.
 */
export const authenticateMachine = (solid: SolidService) =>
  createMachine<AuthenticateContext, AuthenticateEvent, State<AuthenticateStates, AuthenticateContext>>({
    id: AuthenticateActors.AUTHENTICATE_MACHINE,
    initial: AuthenticateStates.INITIAL,

    states: {
    /**
     * We don't know if the user is authenticated or not, but we're checking.
     */
      [AuthenticateStates.INITIAL]: {
      /**
       * Get the current session, and determine if a user is authenticated or not.
       */
        invoke: {
          src: () => solid.getSession(),
          onDone: { actions: handleSessionUpdate },
          onError: { actions: send(AuthenticateEvents.LOGIN_ERROR) },
        },
        on: {
        /**
         * Transition to authenticated when there is an active session.
         */
          [AuthenticateEvents.LOGIN_SUCCESS]: AuthenticateStates.AUTHENTICATED,
          /**
           * Transition to unauthenticated when there is no active session.
           */
          [AuthenticateEvents.LOGIN_ERROR]: AuthenticateStates.UNAUTHENTICATED,
        },
      },
      /**
       * The user is not authenticated.
       */
      [AuthenticateStates.UNAUTHENTICATED]: {
        invoke: [
        /**
         * Invoke a form machine which controls the login form.
         */
          {
            id: FormActors.FORM_MACHINE,
            src: formMachine<{ webId: string }>(
            /**
             * Validates the form.
             */
              (context): Observable<FormValidatorResult[]> =>
                from(solid.getIssuer(context.data?.webId)).pipe(
                  map((result) => result ? [] : [ { field: 'webId', message: 'nde.features.authenticate.error.invalid-webid.invalid-url' } ]),
                  catchError((err: Error) => of([ { field: 'webId', message: err.message } ])),
                ),
              /**
               * Redirects the user to the identity provider.
               *
               * https://wouteraj.inrupt.net/profile/card#me
               * https://pod.inrupt.com/wouteraj/profile/card#me
               */
              async (context) => {

                await solid.login(context.data.webId);

                return context.data;

              },
            ).withContext({
              data: { webId: '' },
              original: { webId: '' },
            }),
            onDone: { actions: send(
              (_, event) => ({ type: AuthenticateEvents.LOGIN_STARTED, webId: event.data.data.webId })
            ) },
            /**
             * Go back to unauthenticated when something goes wrong, and show an alert.
             */
            onError: {
              target: AuthenticateStates.UNAUTHENTICATED,
            },
          },
        ],
        on: {
        /**
         * Transition to redirecting state when the form was submitted.
         */
          [AuthenticateEvents.LOGIN_STARTED]: AuthenticateStates.REDIRECTING,
        },
      },

      /**
       * The user is being redirected to his identity provider.
       */
      [AuthenticateStates.REDIRECTING]: { },

      /**
       * The user has been authenticated.
       */
      [AuthenticateStates.AUTHENTICATED]: {
        data: {
          session: (context: AuthenticateContext) => context?.session,
        },
        type: 'final',
      },
    },
  });
