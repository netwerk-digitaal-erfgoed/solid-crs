import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, RouterEvent, SolidSession } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { DoneInvokeEvent, EventObject } from 'xstate';
import { assign, choose, send } from 'xstate/lib/actions';
import { AppContext } from './app.machine';
import { ClickedDeleteCollectionEvent, SavedCollectionEvent, SelectedCollectionEvent } from 'features/collection/collection.events';
import { SearchUpdatedEvent } from 'features/search/search.events';
import { ClickedDeleteObjectEvent, SelectedObjectEvent } from 'features/object/object.events';

/**
 * Event references for the application root, with readable log format.
 */
export enum AppEvents {
  ADD_ALERT = '[AppEvent: Add alert]',
  DISMISS_ALERT = '[AppEvent: Dismiss alert]',
  ERROR = 'xstate.error',
  LOGGED_IN = '[AppEvent: Logged in]',
  CLICKED_LOGOUT = '[AppEvent: Clicked logout]',
  LOGGED_OUT = '[AppEvent: Logged out]',
  CLICKED_CREATE_COLLECTION = '[AppEvent: Clicked create collection]',
  COLLECTIONS_LOADED = '[AppEvent: Collections loaded]',
  CLICKED_ADMINISTRATOR_TYPE = '[AppEvent: Clicked Admin Pod Type]',
  CLICKED_INSTITUTION_TYPE = '[AppEvent: Clicked Institution Pod Type]',
  SET_PROFILE = '[AppEvent: Set Profile]',
  CLICKED_CREATE_POD = '[AppEvent: Clicked Create Pod]',
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
 * An event which is dispatched when an error occurs.
 */
export class LoggedOutEvent implements EventObject {

  public type: AppEvents.LOGGED_OUT = AppEvents.LOGGED_OUT;

}

/**
 * An event which is dispatched when an error occurs.
 */
export class ClickedLogoutEvent implements EventObject {

  public type: AppEvents.CLICKED_LOGOUT = AppEvents.CLICKED_LOGOUT;

}

/**
 * An event which is dispatched when an error occurs.
 */
export class LoggedInEvent implements EventObject {

  public type: AppEvents.LOGGED_IN = AppEvents.LOGGED_IN;
  constructor(public session: SolidSession) { }

}

/**
 * An event which is dispatched when the collections were successfully retrieved
 */
export class ClickedCreateCollectionEvent implements EventObject {

  public type: AppEvents.CLICKED_CREATE_COLLECTION = AppEvents.CLICKED_CREATE_COLLECTION;

}

/**
 * An event which is dispatched when this pod should be used as an adminstrator pod
 */
export class ClickedAdministratorTypeEvent implements EventObject {

  public type: AppEvents.CLICKED_ADMINISTRATOR_TYPE = AppEvents.CLICKED_ADMINISTRATOR_TYPE;

}

/**
 * An event which is dispatched when this pod should be set up as an instition pod
 */
export class ClickedInstitutionTypeEvent implements EventObject {

  public type: AppEvents.CLICKED_INSTITUTION_TYPE = AppEvents.CLICKED_INSTITUTION_TYPE;

}

/**
 * An event which is dispatched when this pod should be set up as an instition pod
 */
export class SetProfileEvent implements EventObject {

  public type: AppEvents.SET_PROFILE = AppEvents.SET_PROFILE;

}

/**
 * An event which is dispatched when an error occurs.
 */
export class ClickedCreatePodEvent implements EventObject {

  public type: AppEvents.CLICKED_CREATE_POD = AppEvents.CLICKED_CREATE_POD;

}

/**
 * Union type of app events.
 */
export type AppEvent =
  | RouterEvent
  | LoggedInEvent
  | ClickedLogoutEvent
  | LoggedOutEvent
  | ErrorEvent
  | DismissAlertEvent
  | AddAlertEvent
  | SelectedCollectionEvent
  | ClickedDeleteCollectionEvent
  | ClickedCreateCollectionEvent
  | SearchUpdatedEvent
  | SavedCollectionEvent
  | SelectedObjectEvent
  | ClickedDeleteObjectEvent
  | ClickedInstitutionTypeEvent
  | ClickedAdministratorTypeEvent
  | SetProfileEvent
  | ClickedCreatePodEvent;

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
export const setSession = assign({ session: (context, event: LoggedInEvent) => event.session });

/**
 * Action which removes a session in the machine's context.
 */
export const removeSession = assign({ session: (context, event) => undefined });

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
