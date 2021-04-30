import { SolidService } from '@digita-ai/nde-erfgoed-core';
import { formMachine, State, FormActors, FormValidatorResult, FormValidator } from '@digita-ai/nde-erfgoed-components';
import { createMachine } from 'xstate';
import { pure, send } from 'xstate/lib/actions';
import { catchError, map } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { addAlert } from '../collections/collections.events';
import { AuthenticateEvent, AuthenticateEvents, LoginStartedEvent } from './authenticate.events';

/**
 * The context of th authenticate feature.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AuthenticateContext { }

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
          src: () => solid.handleIncomingRedirect(),
          onDone: { actions: send(AuthenticateEvents.LOGIN_SUCCESS) },
          onError: { actions: send(AuthenticateEvents.LOGIN_ERROR) },
        },
        /**
         * Invoke a form machine which controls the login form.
         */
        {
          id: FormActors.FORM_MACHINE,
          src: formMachine<{webId: string}>(
            // validator,
            (context): Observable<FormValidatorResult[]> =>
              from(solid.validateWebId(context.data?.webId)).pipe(
                map((result) => result ? [] : [ { field: 'webId', message: 'nde.features.authenticate.error.invalid-webid.invalid-url' } ]),
                catchError((err: Error) => of([ { field: 'webId', message: err.message } ])),
              ),
          ).withContext({
            data: { webId: ''},
            original: { webId: ''},
          }),
          onDone: { actions: send((_, event) => ({type: AuthenticateEvents.LOGIN_STARTED, webId: event.data.data.webId})) },
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
      invoke: {
        /**
         * Redirects the user to the identity provider.
         */
        src: (_, event: LoginStartedEvent) => solid.login(event.webId),
        onDone: {
          target: AuthenticateStates.AUTHENTICATED,
        },
        /**
         * Go back to unauthenticated when something goes wrong, and show an alert.
         */
        onError: {
          actions: pure((_ctx, event) => addAlert({ message: 'nde.root.alerts.error', type: 'warning' })),
          target: AuthenticateStates.UNAUTHENTICATED,
        },
      },
    },

    /**
     * The user has been authenticated.
     */
    [AuthenticateStates.AUTHENTICATED]: {
      type: 'final',
    },
  },
});
