import { Event, FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';

/**
 * Event references for the object machine, with readable log format.
 */
export enum ObjectEvents {
  CLICKED_DELETE              = '[ObjectsEvent: Clicked Delete]',
  CLICKED_EDIT                = '[ObjectsEvent: Clicked Edit]',
  CLICKED_SAVE                = '[ObjectsEvent: Clicked Save]',
  CANCELLED_EDIT              = '[ObjectsEvent: Cancelled Edit]',
  SELECTED_OBJECT             = '[ObjectsEvent: Selected Object]',
}

/**
 * Fired when the user clicks the delete object button.
 */
export interface ClickedDeleteEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_DELETE;
  object: CollectionObject;
}

/**
 * Fired when the users selects an object.
 */
export interface SelectedObjectEvent extends Event<ObjectEvents> {
  type: ObjectEvents.SELECTED_OBJECT;
  object: CollectionObject;
}

/**
 * Fired when the user clicks the edit button.
 */
export interface ClickedEditEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_EDIT;
}

/**
 * Fired when the user clicks the save button.
 */
export interface ClickedSaveEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_SAVE;
}

/**
 * Fired when the user clicks the cancel button when editing.
 */
export interface CancelledEditEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CANCELLED_EDIT;
}

/**
 * Events for the object machine.
 */
export type ObjectEvent = ClickedDeleteEvent
| ClickedEditEvent
| ClickedSaveEvent
| CancelledEditEvent
| SelectedObjectEvent
| FormSubmittedEvent;
