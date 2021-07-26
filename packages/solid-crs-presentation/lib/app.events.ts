import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { DoneInvokeEvent, EventObject } from 'xstate';
import { assign, choose, send } from 'xstate/lib/actions';
import { AppContext } from './app.machine';
import { SearchUpdatedEvent } from './features/search/search.events';
import { SelectedCollectionEvent } from 'features/collection/collection.events';
import { SelectedObjectEvent } from 'features/object/object.events';

/**
 * Event references for the application root, with readable log format.
 */
export enum AppEvents {
  ADD_ALERT = '[AppEvent: Add alert]',
  DISMISS_ALERT = '[AppEvent: Dismiss alert]',
  ERROR = 'xstate.error',
  COLLECTIONS_LOADED = '[AppEvent: Collections loaded]',
  SET_PROFILE = '[AppEvent: Set Profile]',
}

/**
 * Event interfaces for the application root, with their payloads.
 */

/**
 * An event which is dispatched when an alert is added.
 */
export class AddAlertEvent implements EventObject {

  public type: AppEvents.ADD_ALERT = AppEvents.ADD_ALERT;
  constructor(public alert: Alert) { }

}

/**
 * An event which is dispatched when an alert is dismissed.
 */
export class DismissAlertEvent implements EventObject {

  public type: AppEvents.DISMISS_ALERT = AppEvents.DISMISS_ALERT;
  constructor(public alert: Alert) { }

}

/**
 * An event which is dispatched when an error occurs.
 */
export class ErrorEvent implements EventObject {

  public type: AppEvents.ERROR = AppEvents.ERROR;
  constructor(public data?: { error?: Error | string }) { }

}

/**
 * An event which is dispatched when this pod should be set up as an instition pod
 */
export class SetProfileEvent implements EventObject {

  public type: AppEvents.SET_PROFILE = AppEvents.SET_PROFILE;

}

/**
 * Union type of app events.
 */
export type AppEvent =
  | ErrorEvent
  | DismissAlertEvent
  | AddAlertEvent
  | SelectedCollectionEvent
  | SelectedObjectEvent
  | SetProfileEvent
  | SearchUpdatedEvent;

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
 * Action which saves a list of collections to the machine's context.
 */
export const setCollections = assign({
  collections: (context, event: DoneInvokeEvent<Collection[]>) =>
    event.data.sort((a, b) => a.name?.localeCompare(b.name)),
});

/**
 * Action which adds a single collection to the machine's context.
 */
export const addCollection = assign((context: AppContext, event: DoneInvokeEvent<Collection>) => ({
  collections: [ ...context.collections||[], event.data ],
}));

/**
 * Action which sets a profile in the machine's context.
 */
export const setProfile = assign({ profile:  (context, event: DoneInvokeEvent<AppContext>) => event.data });
