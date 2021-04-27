import { Alert, Event } from '@digita-ai/nde-erfgoed-components';
import { assign, choose, send } from 'xstate/lib/actions';
import { AppContext } from './app.machine';

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
 * Actions for the alerts component.
 */

/**
 * Action which sends an error event.
 */
export const error = (err: Error | string) => send({ type: AppEvents.ERROR, data: { error: err } });

/**
 * Action which adds an alert to the machine's context, if it doesn't already exist.
 */
export const addAlert = choose<AppContext, Event<AppEvents>>([
  {
    cond: (context: AppContext, event: AddAlertEvent) => !event.alert,
    actions: [
      error('Alert should be set when adding alert'),
    ],
  },
  {
    actions: [
      assign<AppContext, Event<AppEvents>>({
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
export const dismissAlert = choose<AppContext, Event<AppEvents>>([
  {
    cond: (context: AppContext, event: DismissAlertEvent) => (!event || !event.alert) ? true : false,
    actions: [
      error('Alert should be set when dismissing alert'),
    ],
  },
  {
    actions: [
      assign<AppContext, Event<AppEvents>>({
        alerts: (context: AppContext, event: DismissAlertEvent) => [
          ...context.alerts ? context.alerts.filter((alert) => alert.message !== event.alert.message) : [],
        ],
      }),
    ],
  },
]);
