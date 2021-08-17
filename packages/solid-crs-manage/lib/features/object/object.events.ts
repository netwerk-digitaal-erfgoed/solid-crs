import { FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObject, Term } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject } from 'xstate';

/**
 * Event references for the object machine, with readable log format.
 */
export enum ObjectEvents {
  CLICKED_SAVE                = '[ObjectsEvent: Clicked Save]',
  CLICKED_DELETE              = '[ObjectsEvent: Clicked Delete]',
  CLICKED_RESET               = '[ObjectsEvent: Clicked Reset]',
  SELECTED_OBJECT             = '[ObjectsEvent: Selected Object]',
  CLICKED_TERM_FIELD          = '[ObjectsEvent: Clicked Term Field]',
  CLICKED_SIDEBAR_ITEM        = '[ObjectsEvent: Clicked Sidebar Item]',
}

/**
 * Fired when the user clicks the delete object button.
 */
export class ClickedDeleteObjectEvent implements EventObject {

  public type: ObjectEvents.CLICKED_DELETE = ObjectEvents.CLICKED_DELETE;
  constructor(public object: CollectionObject) { }

}

/**
 * Fired when the form machine completes.
 */
export class ClickedSaveEvent implements EventObject {

  public type: ObjectEvents.CLICKED_SAVE = ObjectEvents.CLICKED_SAVE;
  constructor(public object: CollectionObject) { }

}

/**
 * Fired when the users selects an object.
 */
export class SelectedObjectEvent implements EventObject {

  public type: ObjectEvents.SELECTED_OBJECT = ObjectEvents.SELECTED_OBJECT;
  constructor(public object: CollectionObject) { }

}

/**
 * Fired when the user clicks the reset button.
 */
export class ClickedResetEvent implements EventObject {

  public type: ObjectEvents.CLICKED_RESET = ObjectEvents.CLICKED_RESET;

}

/**
 * Fired when the user clicks a Term's form input.
 */
export class ClickedTermFieldEvent implements EventObject {

  public type: ObjectEvents.CLICKED_TERM_FIELD = ObjectEvents.CLICKED_TERM_FIELD;
  constructor(public field: string, public terms: Term[]) { }

}

/**
 * Fired when the user clicks a sidebar item.
 */
export class ClickedObjectSidebarItem implements EventObject {

  public type: ObjectEvents.CLICKED_SIDEBAR_ITEM = ObjectEvents.CLICKED_SIDEBAR_ITEM;
  constructor(public itemId: string) { }

}

/**
 * Events for the object machine.
 */
export type ObjectEvent = ClickedDeleteObjectEvent
| SelectedObjectEvent
| FormSubmittedEvent
| ClickedDeleteObjectEvent
| ClickedResetEvent
| ClickedTermFieldEvent
| ClickedObjectSidebarItem
| ClickedSaveEvent;
