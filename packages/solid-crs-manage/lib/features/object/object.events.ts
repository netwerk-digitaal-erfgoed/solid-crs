import { FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObject, Term } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject } from 'xstate';

/**
 * Event references for the object machine, with readable log format.
 */
export enum ObjectEvents {
  CLICKED_SAVE                    = '[ObjectEvent: Clicked Save]',
  CLICKED_DELETE                  = '[ObjectEvent: Clicked Delete]',
  CLICKED_RESET                   = '[ObjectEvent: Clicked Reset]',
  CLICKED_TERM_FIELD              = '[ObjectEvent: Clicked Term Field]',
  CLICKED_CANCEL_TERM             = '[ObjectEvent: Clicked Cancel Term]',
  CLICKED_SIDEBAR_ITEM            = '[ObjectEvent: Clicked Sidebar Item]',
  CLICKED_OBJECT_UPDATES_OVERVIEW = '[ObjectEvent: Clicked Object Updates Overview]',
  SELECTED_OBJECT                 = '[ObjectEvent: Selected Object]',
  SELECTED_TERMS                  = '[ObjectEvent: Selected Terms]',
  CLICKED_IMPORT_UPDATES          = '[ObjectEvent: Clicked Import Updates]',
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
 * Fired when the users selects an object.
 */
export class SelectedTermsEvent implements EventObject {

  public type: ObjectEvents.SELECTED_TERMS = ObjectEvents.SELECTED_TERMS;
  constructor(public field: string, public terms: Term[]) { }

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
 * Fired when the user clicks the cancel button in a Term's form.
 */
export class ClickedCancelTermEvent implements EventObject {

  public type: ObjectEvents.CLICKED_CANCEL_TERM = ObjectEvents.CLICKED_CANCEL_TERM;

}

/**
 * Fired when the user clicks a sidebar item.
 */
export class ClickedObjectSidebarItem implements EventObject {

  public type: ObjectEvents.CLICKED_SIDEBAR_ITEM = ObjectEvents.CLICKED_SIDEBAR_ITEM;
  constructor(public itemId: string) { }

}

/**
 * Fired when the user clicks the updates button to view updates for an object.
 */
export class ClickedObjectUpdatesOverview implements EventObject {

  public type: ObjectEvents.CLICKED_OBJECT_UPDATES_OVERVIEW = ObjectEvents.CLICKED_OBJECT_UPDATES_OVERVIEW;

}

/**
 * Fired when the user accepts changes on metadata updates
 */
export class ClickedImportUpdates implements EventObject {

  public type: ObjectEvents.CLICKED_IMPORT_UPDATES = ObjectEvents.CLICKED_IMPORT_UPDATES;
  constructor(public collectionUri: string) { }

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
| ClickedCancelTermEvent
| ClickedObjectSidebarItem
| ClickedSaveEvent
| ClickedObjectUpdatesOverview
| ClickedImportUpdates;
