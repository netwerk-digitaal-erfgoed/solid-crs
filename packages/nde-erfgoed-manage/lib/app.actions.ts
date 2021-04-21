import { assign } from 'xstate';
import { AppContext } from './app.context';
import { AddAlertEvent } from './app.events';

/**
 * Actions for the alerts component.
 */

/**
 * Actions which adds an alert to the machine's context, if it doesn't already exist.
 */
export const addAlert = assign<AppContext, AddAlertEvent>({
  alerts: (context, event) => [
    ...context.alerts ?context.alerts.filter((alert) => alert.message !== event.alert.message) : [],
    event.alert,
  ],
});
