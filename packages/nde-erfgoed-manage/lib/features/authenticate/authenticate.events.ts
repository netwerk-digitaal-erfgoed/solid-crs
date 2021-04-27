import { Event } from '@digita-ai/nde-erfgoed-components';

/**
 * Event references for the authenticate component, with readable log format.
 */
export enum AuthenticateEvents {
  CLICKED_LOGIN     = '[AuthenticateEvent: Clicked Login]',
  CLICKED_LOGOUT    = '[AuthenticateEvent: Clicked Logout]',
  LOGIN_SUCCESS     = '[AuthenticateEvent: Login Success]',
  LOGIN_ERROR       = '[AuthenticateEvent: Login Error]',
  SESSION_RESTORED  = '[AuthenticateEvent: Session Restored]',
}

/**
 * Event interfaces for the authenticate component, with their payloads.
 */

/**
 * An event which is dispatched when a user clicks the login button.
 */
export interface ClickedLoginEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.CLICKED_LOGIN; webId: string }

/**
 * An event which is dispatched when a user clicks the logout button.
 */
export interface ClickedLogoutEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.CLICKED_LOGOUT }

/**
 * An event which is dispatched when a user login was successful.
 */
export interface LoginSuccessEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.LOGIN_SUCCESS }

/**
 * An event which is dispatched when a user login failed.
 */
export interface LoginErrorEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.LOGIN_ERROR; message: string }

/**
 * An event which is dispatched when a session was able to be restored.
 */
export interface SessionRestoredEvent extends Event<AuthenticateEvents> { type: AuthenticateEvents.SESSION_RESTORED }
