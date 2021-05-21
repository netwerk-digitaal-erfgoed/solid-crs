import { Event, FormSubmittedEvent } from '@digita-ai/nde-erfgoed-components';
import { CollectionObject } from '@digita-ai/nde-erfgoed-core';

export enum ObjectEvents {
  CLICKED_DELETE              = '[ObjectsEvent: Clicked Delete]',
  CLICKED_EDIT                = '[ObjectsEvent: Clicked Edit]',
  CLICKED_SAVE                = '[ObjectsEvent: Clicked Save]',
  CANCELLED_EDIT              = '[ObjectsEvent: Cancelled Edit]',
  SELECTED_OBJECT             = '[ObjectsEvent: Selected Object]',
}

export interface ClickedDeleteEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_DELETE;
  object: CollectionObject;
}

export interface SelectedObjectEvent extends Event<ObjectEvents> {
  type: ObjectEvents.SELECTED_OBJECT;
  object: CollectionObject;
}

export interface ClickedEditEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_EDIT;
}

export interface ClickedSaveEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CLICKED_SAVE;
}

export interface CancelledEditEvent extends Event<ObjectEvents> {
  type: ObjectEvents.CANCELLED_EDIT;
}

export type ObjectEvent = ClickedDeleteEvent
| ClickedEditEvent
| ClickedSaveEvent
| CancelledEditEvent
| SelectedObjectEvent
| FormSubmittedEvent;
