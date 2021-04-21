import { ArgumentError } from '@digita-ai/nde-erfgoed-core';
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
  alerts: (context, event) => {
    if (!event || !event.alert) {
      throw new ArgumentError('Argument event && event.alert should be set.', event || !event.alert);
    }
    return [
      ...context.alerts ?context.alerts.filter((alert) => alert.message !== event.alert.message) : [],
      event.alert,
    ];
  },
});
