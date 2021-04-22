import { assign } from 'xstate';
import { choose, send } from 'xstate/lib/actions';
import { AppContext } from './app.context';
import { AddAlertEvent, AppEvents, DismissAlertEvent } from './app.events';

/**
 * Actions for the alerts component.
 */

/**
 * Action which sends an error event.
 */
export const error = send({ type: AppEvents.ERROR });

/**
 * Action which adds an alert to the machine's context, if it doesn't already exist.
 */
export const addAlert = choose<AppContext, AddAlertEvent>([
  {
    cond: (context, event) => (!event || !event.alert) ? true : false,
    actions: [
      error,
    ],
  },
  {
    actions: [
      assign<AppContext, AddAlertEvent>({
        alerts: (context, event) => [
          ...context.alerts ? context.alerts.filter((alert) => alert.message !== event.alert.message) : [],
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
    cond: (context, event) => (!event || !event.alert) ? true : false,
    actions: [
      error,
    ],
  },
  {
    actions: [
      assign<AppContext, DismissAlertEvent>({
        alerts: (context, event) => [
          ...context.alerts ? context.alerts.filter((alert) => alert.message !== event.alert.message) : [],
        ],
      }),
    ],
  },
]);
