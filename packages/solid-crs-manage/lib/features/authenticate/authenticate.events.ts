import { SolidSession } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Event } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { DoneInvokeEvent } from 'xstate';
import { assign, choose, send } from 'xstate/lib/actions';
import { AuthenticateContext } from './authenticate.machine';

/**
 * Event references for the authenticate component, with readable log format.
 */
export enum AuthenticateEvents {
  LOGIN_STARTED     = '[AuthenticateEvent: Login started]',
  LOGIN_SUCCESS     = '[AuthenticateEvent: Login Success]',
  LOGIN_ERROR       = '[AuthenticateEvent: Login Error]',
}

/**
 * Event interfaces for the authenticate component, with their payloads.
 */

/**
 * An event which is dispatched when a user clicks the login button.
 */
export interface LoginStartedEvent extends Event<AuthenticateEvents> {
  type: AuthenticateEvents.LOGIN_STARTED; webId: string;
}

/**
 * An event which is dispatched when a user login was successful.
 */
export interface LoginSuccessEvent extends Event<AuthenticateEvents> {
  type: AuthenticateEvents.LOGIN_SUCCESS;
}

/**
 * An event which is dispatched when a user login failed.
 */
export interface LoginErrorEvent extends Event<AuthenticateEvents> {
  type: AuthenticateEvents.LOGIN_ERROR; message: string;
}

/**
 * Union type of all authenticate events
 */
export type AuthenticateEvent = LoginStartedEvent | LoginSuccessEvent | LoginStartedEvent | LoginErrorEvent;

/**
 * Handles an update of the active session.
 */
export const handleSessionUpdate = choose<AuthenticateContext, DoneInvokeEvent<SolidSession>>([
  {
    cond: (context: AuthenticateContext, event: DoneInvokeEvent<SolidSession>) => !event.data,
    actions: [
      send(AuthenticateEvents.LOGIN_ERROR),
    ],
  },
  {
    actions: [
      assign({ session: (context, event) => event.data }),
      send(AuthenticateEvents.LOGIN_SUCCESS),
    ],
  },
]);
