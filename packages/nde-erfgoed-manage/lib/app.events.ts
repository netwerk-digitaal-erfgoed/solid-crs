import { Alert } from '@digita-ai/nde-erfgoed-components';
import { EventObject } from 'xstate';

/**
 * Event references for the application root, with readable log format.
 */
export enum AppEvents {
  ADD_ALERT = '[AppEvent: Add alert]',
  DISMISS_ALERT = '[AppEvent: Dismiss alert]',
  ERROR = 'xstate.error',
}

/**
 * Event interfaces for the application root, with their payloads.
 */

/**
 * An event which is dispatched when an alert is added.
 */
export interface AddAlertEvent extends EventObject { type: AppEvents.ADD_ALERT; alert: Alert }

/**
 * An event which is dispatched when an alert is dismissed.
 */
export interface DismissAlertEvent extends EventObject { type: AppEvents.DISMISS_ALERT; alert: Alert }

/**
 * An event which is dispatched when an error occurs.
 */
export interface ErrorEvent extends EventObject { type: AppEvents.ERROR; data?: { error?: Error | string } }

/**
 * Union type of the event interfaces for the collection component.
 */
export type AppEvent =
  | AddAlertEvent
  | DismissAlertEvent
  | ErrorEvent;
