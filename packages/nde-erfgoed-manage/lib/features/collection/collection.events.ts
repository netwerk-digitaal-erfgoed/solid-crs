import { Alert, Event, FormSubmittedEvent } from '@digita-ai/nde-erfgoed-components';
import { sendParent } from 'xstate';
import { AppEvents, SelectedCollectionEvent } from '../../app.events';

/**
 * Event references for the collection component, with readable log format.
 */
export enum CollectionEvents {
  CLICKED_DELETE              = '[CollectionsEvent: Clicked Delete]',
  CLICKED_EDIT                = '[CollectionsEvent: Clicked Edit]',
  CANCELLED_EDIT              = '[CollectionsEvent: Cancelled Edit]',
  CLICKED_CREATE_OBJECT       = '[CollectionsEvent: Clicked Create Object]',
  SELECTED_COLLECTION         = '[CollectionsEvent: Selected collection]',
}

/**
 * Event interfaces for the collection component, with their payloads.
 */

/**
 * Fired when the user clicks the delete collection button.
 */
export interface ClickedDeleteEvent extends Event<CollectionEvents> {
  type: CollectionEvents.CLICKED_DELETE;
}

/**
 * Fired when the user clicks the edit button.
 */
export interface ClickedEditEvent extends Event<CollectionEvents> {
  type: CollectionEvents.CLICKED_EDIT;
}

/**
 * Fired when the user clicks the cancel button when editing.
 */
export interface CancelledEditEvent extends Event<CollectionEvents> {
  type: CollectionEvents.CANCELLED_EDIT;
}

/**
 * Fired when the user clicks the add object button.
 */
export interface ClickedCreateObjectEvent extends Event<CollectionEvents> {
  type: CollectionEvents.CLICKED_CREATE_OBJECT;
}

/**
 * Actions for the collections machine.
 */
export type CollectionEvent =
  ClickedDeleteEvent
  | ClickedEditEvent
  | CancelledEditEvent
  | ClickedCreateObjectEvent
  | SelectedCollectionEvent
  | FormSubmittedEvent;

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
