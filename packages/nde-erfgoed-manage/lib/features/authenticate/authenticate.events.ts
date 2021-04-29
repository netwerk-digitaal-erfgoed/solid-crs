import { Event } from '@digita-ai/nde-erfgoed-components';

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
export interface LoginStartedEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.LOGIN_STARTED; webId: string }

/**
 * An event which is dispatched when a user login was successful.
 */
export interface LoginSuccessEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.LOGIN_SUCCESS }

/**
 * An event which is dispatched when a user login failed.
 */
export interface LoginErrorEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.LOGIN_ERROR; message: string }

/**
 * Union type of all authenticate events
 */
export type AuthenticateEvent = LoginStartedEvent | LoginSuccessEvent | LoginStartedEvent;
