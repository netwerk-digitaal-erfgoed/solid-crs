import { Alert, Event } from '@digita-ai/nde-erfgoed-components';
import { assign, choose, send } from 'xstate/lib/actions';
import { AppContext } from './app.machine';
import { SolidSession } from './common/solid/solid-session';

/**
 * Event references for the application root, with readable log format.
 */
export enum AppEvents {
  ADD_ALERT = '[AppEvent: Add alert]',
  DISMISS_ALERT = '[AppEvent: Dismiss alert]',
  ERROR = 'xstate.error',
  LOGGED_IN = '[AppEvent: Logged in]',
  LOGGING_OUT = '[AppEvent: Logging out]',
  LOGGED_OUT = '[AppEvent: Logged out]',
}

/**
 * Event interfaces for the application root, with their payloads.
 */

/**
 * An event which is dispatched when an alert is added.
 */
export interface AddAlertEvent extends Event<AppEvents> { type: AppEvents.ADD_ALERT; alert: Alert }

/**
 * An event which is dispatched when an alert is dismissed.
 */
export interface DismissAlertEvent extends Event<AppEvents> { type: AppEvents.DISMISS_ALERT; alert: Alert }

/**
 * An event which is dispatched when an error occurs.
 */
export interface ErrorEvent extends Event<AppEvents> { type: AppEvents.ERROR; data?: { error?: Error | string } }

/**
 * An event which is dispatched when an error occurs.
 */
export interface LoggedOutEvent extends Event<AppEvents> { type: AppEvents.LOGGING_OUT }

/**
 * An event which is dispatched when an error occurs.
 */
export interface LoggingOutEvent extends Event<AppEvents> { type: AppEvents.LOGGED_OUT }

/**
 * An event which is dispatched when an error occurs.
 */
export interface LoggedInEvent extends Event<AppEvents> { type: AppEvents.LOGGED_IN; session: SolidSession }

/**
 * Union type of app events.
 */
export type AppEvent =
  | LoggedInEvent
  | LoggingOutEvent
  | LoggedOutEvent
  | ErrorEvent
  | DismissAlertEvent
  | AddAlertEvent;

/**
 * Actions for the alerts component.
 */

/**
 * Action which sends an error event.
 */
export const error = (err: Error | string) => send({ type: AppEvents.ERROR, data: { error: err } });

/**
 * Action which adds an alert to the machine's context, if it doesn't already exist.
 */
export const addAlert = choose<AppContext, AddAlertEvent>([
  {
    cond: (context: AppContext, event: AddAlertEvent) => !event.alert,
    actions: [
      error('Alert should be set when adding alert'),
    ],
  },
  {
    actions: [
      assign<AppContext, AddAlertEvent>({
        alerts: (context: AppContext, event: AddAlertEvent) => [
          ...context.alerts ? context.alerts.filter((alert: Alert) => alert.message !== event.alert.message) : [],
          event.alert,
        ],
      }),
    ],
  },
]);

/**
 * Action which dismisses an alert in the machine's context, if it doesn't already exist.
 */
export const dismissAlert = choose<AppContext, DismissAlertEvent>([
  {
    cond: (context: AppContext, event: DismissAlertEvent) => (!event || !event.alert) ? true : false,
    actions: [
      error('Alert should be set when dismissing alert'),
    ],
  },
  {
    actions: [
      assign<AppContext, DismissAlertEvent>({
        alerts: (context: AppContext, event: DismissAlertEvent) => [
          ...context.alerts ? context.alerts.filter((alert) => alert.message !== event.alert.message) : [],
        ],
      }),
    ],
  },
]);

/**
 * Action which sets a session in the machine's context.
 */
export const setSession = assign({session: (context, event: LoggedInEvent) => event.session});

/**
 * Action which removes a session in the machine's context.
 */
export const removeSession = assign({session: (context, event) => undefined});
