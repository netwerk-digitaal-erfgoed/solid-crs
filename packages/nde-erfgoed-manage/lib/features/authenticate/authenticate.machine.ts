import { SolidService } from '@digita-ai/nde-erfgoed-core';
import { Event, formMachine, State, FormActors, FormContext, FormValidatorResult, FormEvents } from '@digita-ai/nde-erfgoed-components';
import { createMachine } from 'xstate';
import { pure, send } from 'xstate/lib/actions';
import { map, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { addAlert } from '../collections/collections.events';
import { AuthenticateEvents } from './authenticate.events';

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
const validator = (context: FormContext<{ webId: string }>, event: Event<FormEvents>): FormValidatorResult[] =>
  context.data?.webId && context.data?.webId.length > 0 ? [] : [ { field: 'webId', message: 'nde.features.authenticate.error.invalid-webid.invalid-url' } ];

/**
 * The authenticate machine.
 */
export const authenticateMachine = (solid: SolidService) => createMachine<AuthenticateContext, Event<AuthenticateEvents>, State<AuthenticateStates, AuthenticateContext>>({
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
          src: () => solid.handleIncomingRedirect().pipe(
            switchMap(() => throwError(new Error())),
            map(() => ({ type: AuthenticateEvents.LOGIN_SUCCESS, webId: ''})),
          ),
          onDone: { actions: send(AuthenticateEvents.LOGIN_SUCCESS) },
          onError: { actions: send(AuthenticateEvents.LOGIN_ERROR) },
        },
        /**
         * Invoke a form machine which controls the login form.
         */
        {
          id: FormActors.FORM_MACHINE,
          src: formMachine(validator).withContext({
            data: { webId: ''},
            original: { webId: ''},
          }),
          onDone: { actions: send(AuthenticateEvents.LOGIN_STARTED) },
        },
      ],
      on: {
        [AuthenticateEvents.LOGIN_STARTED]: AuthenticateStates.REDIRECTING,
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
        src: () => solid.login().pipe(
          map(() => ({ type: AuthenticateEvents.LOGIN_SUCCESS, webId: ''})),
        ),
        /**
         * Go back to unauthenticated when something goes wrong, and show an alert.
         */
        onError: {
          actions: pure((_ctx, event) => addAlert({ message: event.data.toString().split('Error: ')[1], type: 'warning' })),
          target: AuthenticateStates.UNAUTHENTICATED,
        },
      },
      type: 'final',
    },

    /**
     * The user has been authenticated.
     */
    [AuthenticateStates.AUTHENTICATED]: {
      type: 'final',
    },
  },
});
