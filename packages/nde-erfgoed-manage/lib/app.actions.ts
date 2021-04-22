import { ArgumentError } from '@digita-ai/nde-erfgoed-core';
import { assign, EventObject } from 'xstate';
import { choose, raise } from 'xstate/lib/actions';
import { AppContext } from './app.context';
import { AddAlertEvent, AppEvents, DismissAlertEvent, ErrorEvent } from './app.events';

/**
 * Actions for the alerts component.
 */

/**
 * Actions which handles an error event.
 */
export const error = raise<AppContext, ErrorEvent>({ type: AppEvents.ERROR });

/**
 * Actions which adds an alert to the machine's context, if it doesn't already exist.
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
 * Actions which dismisses an alert in the machine's context, if it doesn't already exist.
 */
export const dismissAlert = assign<AppContext, DismissAlertEvent>({
  alerts: (context, event) => {
    if (!event || !event.alert) {
      throw new ArgumentError('Argument event && event.alert should be set.', event || !event.alert);
    }
    return [
      ...context.alerts ? context.alerts.filter((alert) => alert.message !== event.alert.message) : [],
    ];
  },
});
