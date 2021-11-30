import { Alert, FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject, sendParent } from 'xstate';
import { AppEvents } from '../../app.events';
import { ClickedDeleteObjectEvent, SelectedObjectEvent } from '../object/object.events';

/**
 * Event references for the collection machine, with readable log format.
 */
export enum CollectionEvents {
  CLICKED_DELETE              = '[CollectionsEvent: Clicked Delete]',
  CLICKED_EDIT                = '[CollectionsEvent: Clicked Edit]',
  CLICKED_SAVE                = '[CollectionsEvent: Clicked Save]',
  CANCELLED_EDIT              = '[CollectionsEvent: Cancelled Edit]',
  CLICKED_CREATE_OBJECT       = '[CollectionsEvent: Clicked Create Object]',
  SELECTED_COLLECTION         = '[CollectionsEvent: Selected collection]',
  SAVED_COLLECTION            = '[CollectionsEvent: Saved collection]',
}

/**
 * Event classes for the collection component, with their payloads.
 */

/**
 * Fired when the user clicks the delete collection button.
 */
export class ClickedDeleteCollectionEvent implements EventObject {

  public type: CollectionEvents.CLICKED_DELETE = CollectionEvents.CLICKED_DELETE;
  constructor(public collection: Collection) { }

}

/**
 * Fired when the user clicks the edit button.
 */
export class ClickedEditEvent implements EventObject {

  public type: CollectionEvents.CLICKED_EDIT = CollectionEvents.CLICKED_EDIT;

}

/**
 * Fired when the user clicks the save button.
 */
export class ClickedSaveEvent implements EventObject {

  public type: CollectionEvents.CLICKED_SAVE = CollectionEvents.CLICKED_SAVE;

}

/**
 * Fired when the user clicks the cancel button when editing.
 */
export class CancelledEditEvent implements EventObject {

  public type: CollectionEvents.CANCELLED_EDIT = CollectionEvents.CANCELLED_EDIT;

}

/**
 * Fired when the user clicks the add object button.
 */
export class ClickedCreateObjectEvent implements EventObject {

  public type: CollectionEvents.CLICKED_CREATE_OBJECT = CollectionEvents.CLICKED_CREATE_OBJECT;

}

/**
 * An event which is dispatched when the collections were successfully retrieved
 */
export class SelectedCollectionEvent implements EventObject {

  public type: CollectionEvents.SELECTED_COLLECTION = CollectionEvents.SELECTED_COLLECTION;
  constructor(public collection: Collection) { }

}

/**
 * Fired when the application is done saving a collection.
 */
export class SavedCollectionEvent implements EventObject {

  public type: CollectionEvents.SAVED_COLLECTION = CollectionEvents.SAVED_COLLECTION;

}

/**
 * Events for the collection machine.
 */
export type CollectionEvent =
  SelectedCollectionEvent
  | ClickedDeleteCollectionEvent
  | ClickedEditEvent
  | ClickedSaveEvent
  | CancelledEditEvent
  | ClickedCreateObjectEvent
  | FormSubmittedEvent
  | SelectedObjectEvent
  | SavedCollectionEvent
  | ClickedDeleteObjectEvent;

/**
 * Adds an alert to the machine's parent.
 *
 * @param alert Alert to be added.
 * @returns An action which sends an add alert event to the machine's parent.
 */
export const addAlert = (alert: Alert) => sendParent((context, event) => ({
  alert,
  type: AppEvents.ADD_ALERT,
}));
