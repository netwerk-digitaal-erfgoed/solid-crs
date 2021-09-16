import { FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject } from 'xstate';

/**
 * Event references for the object machine, with readable log format.
 */
export enum ObjectEvents {
  SELECTED_OBJECT             = '[ObjectsEvent: Selected Object]',
  CLICKED_SIDEBAR_ITEM        = '[ObjectsEvent: Clicked Sidebar Item]',
}

/**
 * Fired when the users selects an object.
 */
export class SelectedObjectEvent implements EventObject {

  public type: ObjectEvents.SELECTED_OBJECT = ObjectEvents.SELECTED_OBJECT;
  constructor(public object: CollectionObject) { }

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
export type ObjectEvent =
| SelectedObjectEvent
| FormSubmittedEvent
| ClickedObjectSidebarItem;
