import { Alert } from '@digita-ai/nde-erfgoed-components';
import { EventObject } from 'xstate';

/**
 * Event references for the application root, with readable log format.
 */
export enum AppEvents {
  LOGIN  = '[AppEvent: Login]',
  LOGOUT = '[AppEvent: Logout]',
  ADD_ALERT = '[AppEvent: Add alert]',
}

/**
 * Event interfaces for the application root, with their payloads.
 */

/**
 * An event which is dispatched when a user authenticates.
 */
export interface LoginEvent extends EventObject { type: AppEvents.LOGIN }

/**
 * An event which is dispatched when a user logs out.
 */
export interface LogoutEvent extends EventObject { type: AppEvents.LOGOUT }

/**
 * An event which is fired when an alert is added.
 */
export interface AddAlertEvent extends EventObject { type: AppEvents.ADD_ALERT; alert: Alert }

/**
 * Union type of the event interfaces for the collection component.
 */
export type AppEvent =
  | LoginEvent
  | LogoutEvent
  | AddAlertEvent;

