import { Alert, Event, FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject, SendAction, sendParent } from 'xstate';
import { AppEvents } from '../../app.events';
import { SelectedObjectEvent } from '../object/object.events';

/**
 * Event references for the collection machine, with readable log format.
 */
export enum CollectionEvents {
  SELECTED_COLLECTION = '[CollectionsEvent: Selected collection]',
}

/**
 * Event interfaces for the collection component, with their payloads.
 */

/**
 * An event which is dispatched when the collections were successfully retrieved
 */
export class SelectedCollectionEvent implements EventObject {

  public type: CollectionEvents.SELECTED_COLLECTION = CollectionEvents.SELECTED_COLLECTION;
  constructor(public collection: Collection) { }

}

/**
 * Events for the collection machine.
 */
export type CollectionEvent =
  SelectedCollectionEvent
  | FormSubmittedEvent
  | SelectedObjectEvent;

/**
 * Adds an alert to the machine's parent.
 *
 * @param alert Alert to be added.
 * @returns An action which sends an add alert event to the machine's parent.
 */
export const addAlert = (alert: Alert): SendAction<unknown, EventObject, { alert: Alert; type: AppEvents.ADD_ALERT }> =>
  sendParent(() => ({
    alert,
    type: AppEvents.ADD_ALERT,
  }));
