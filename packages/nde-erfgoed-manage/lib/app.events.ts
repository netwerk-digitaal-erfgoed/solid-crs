import { EventObject } from 'xstate';

/**
 * Event references for the application root, with readable log format.
 */
export enum AppEvents {
  LOGIN  = '[AppEvent: Login]',
  LOGOUT = '[AppEvent: Logout]',
}

/**
 * Event interfaces for the application root, with their payloads.
 */
export interface LoginEvent extends EventObject { type: AppEvents.LOGIN }
export interface LogoutEvent extends EventObject { type: AppEvents.LOGOUT }

/**
 * Union type of the event interfaces for the collection component.
 */
export type AppEvent =
  | LoginEvent
  | LogoutEvent;

