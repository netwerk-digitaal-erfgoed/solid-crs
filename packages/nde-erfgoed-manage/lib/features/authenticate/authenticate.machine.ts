import { SolidService, SolidSession } from '@digita-ai/nde-erfgoed-core';
import { formMachine, State, FormActors, FormValidatorResult, FormValidator } from '@digita-ai/nde-erfgoed-components';
import { createMachine } from 'xstate';
import { send } from 'xstate/lib/actions';
import { catchError, map } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { addAlert } from '../../app.events';
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
  AUTHENTICATED    = '[AuthenticateState: Authenticated]',
  REDIRECTING = '[AuthenticateState: Redirecting]',
  UNAUTHENTICATED  = '[AuthenticateState: Unauthenticated]',
}

/**
 * Validated the WebID form.
 *
 * @param context The form's context, which includes the data to validate.
 * @param event The even which triggered the validation.
 * @returns Validation results, or an empty array when valid.
 */
const validator: FormValidator<{ webId: string }> = (context) =>
  of(context.data?.webId && context.data?.webId.length > 0 ? [] : [ { field: 'webId', message: 'nde.features.authenticate.error.invalid-webid.invalid-url' } ]);

/**
 * The authenticate machine.
 */
export const authenticateMachine = (solid: SolidService) => createMachine<AuthenticateContext, AuthenticateEvent, State<AuthenticateStates, AuthenticateContext>>({
  id: AuthenticateActors.AUTHENTICATE_MACHINE,
  initial: AuthenticateStates.UNAUTHENTICATED,

  states: {
    /**
     * The user is not authenticated.
     */
    [AuthenticateStates.UNAUTHENTICATED]: {
      invoke: [
        /**
         * Listen for redirects, and determine if a user is authenticated or not.
         */
        {
          src: () => solid.getSession(),
          onDone: { actions: handleSessionUpdate },
          onError: { actions: send(AuthenticateEvents.LOGIN_ERROR) },
        },
        /**
         * Invoke a form machine which controls the login form.
         */
        {
          id: FormActors.FORM_MACHINE,
          src: formMachine<{webId: string}>(
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
            (context) => solid.login(context.data.webId),
          ).withContext({
            data: { webId: ''},
            original: { webId: ''},
          }),
          onDone: { actions: send((_, event) => ({type: AuthenticateEvents.LOGIN_STARTED, webId: event.data.data.webId})) },
          /**
           * Go back to unauthenticated when something goes wrong, and show an alert.
           */
          onError: {
            actions: (_ctx, event) => addAlert({ message: event.data.message, type: 'warning' }),
            target: AuthenticateStates.UNAUTHENTICATED,
          },
        },
      ],
      on: {
        /**
         * Transition to redirecting state when the form was submitted.
         */
        [AuthenticateEvents.LOGIN_STARTED]: AuthenticateStates.REDIRECTING,
        /**
         * Transition to authenticated when a redirect leads to a successful login.
         */
        [AuthenticateEvents.LOGIN_SUCCESS]: AuthenticateStates.AUTHENTICATED,
      },
    },

    /**
     * The user is being redirected to his identity provider.
     */
    [AuthenticateStates.REDIRECTING]: {
      type: 'final',
    },

    /**
     * The user has been authenticated.
     */
    [AuthenticateStates.AUTHENTICATED]: {
      data: {
        session: (context: AuthenticateContext) => context.session,
      },
      type: 'final',
    },
  },
});
