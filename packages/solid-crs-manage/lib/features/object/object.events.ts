import { Event, FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';

/**
 * Event references for the object machine, with readable log format.
 */
export enum ObjectEvents {
  CLICKED_DELETE              = '[ObjectsEvent: Clicked Delete]',
  CLICKED_SAVE                = '[ObjectsEvent: Clicked Save]',
  CLICKED_RESET               = '[ObjectsEvent: Clicked Reset]',
  SELECTED_OBJECT             = '[ObjectsEvent: Selected Object]',
  CLICKED_TERM_FIELD               = '[ObjectsEvent: Clicked Term Field]',
}

/**
 * Fired when the user clicks the delete object button.
 */
export interface ClickedDeleteObjectEvent extends Event<ObjectEvents> {
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
 * Fired when the user clicks the reset button.
 */
export interface ClickedResetEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_RESET;
}

/**
 * Fired when the user clicks the save button.
 */
export interface ClickedSaveEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_SAVE;
}

/**
 * Fired when the user clicks a Term's form input.
 */
export interface ClickedTermFieldEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_TERM_FIELD;
  field: string;
}

/**
 * Events for the object machine.
 */
export type ObjectEvent = ClickedDeleteObjectEvent
| ClickedSaveEvent
| SelectedObjectEvent
| FormSubmittedEvent
| ClickedDeleteObjectEvent
| ClickedResetEvent
| ClickedTermFieldEvent;
