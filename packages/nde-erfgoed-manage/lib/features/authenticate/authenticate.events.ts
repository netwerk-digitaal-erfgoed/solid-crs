import { EventObject } from 'xstate';

/**
 * Event references for the authenticate component, with readable log format.
 */
export enum AuthenticateEvents {
  CLICKED_LOGIN     = '[AuthenticateEvent: Clicked Login]',
  CLICKED_LOGOUT    = '[AuthenticateEvent: Clicked Logout]',
  LOGIN_SUCCESS     = '[AuthenticateEvent: Login Success]',
  LOGIN_ERROR       = '[AuthenticateEvent: Login Error]',
}

/**
 * Event interfaces for the authenticate component, with their payloads.
 */
export interface ClickedLoginEvent extends EventObject { type: AuthenticateEvents.CLICKED_LOGIN; webId: string }
export interface ClickedLogoutEvent extends EventObject { type: AuthenticateEvents.CLICKED_LOGOUT }
export interface LoginSuccessEvent extends EventObject { type: AuthenticateEvents.LOGIN_SUCCESS }
export interface LoginErrorEvent extends EventObject { type: AuthenticateEvents.LOGIN_ERROR; message: string }

/**
 * Union event type of the interfaces for the authenticate component.
 */
export type AuthenticateEvent =
  | ClickedLoginEvent
  | LoginSuccessEvent
  | ClickedLogoutEvent
  | LoginErrorEvent;
