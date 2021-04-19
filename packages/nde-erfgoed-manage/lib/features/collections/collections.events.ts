import { Collection } from '@digita-ai/nde-erfgoed-core';
import { EventObject } from 'xstate';

/**
 * Event references for the collection component, with readable log format.
 */
export enum CollectionsEvents {
  CLICKED_LOAD             = '[CollectionsEvent: Clicked Load]',
  CLICKED_ADD              = '[CollectionsEvent: Clicked Add]',
  CLICKED_LOGOUT           = '[CollectionsEvent: Clicked Logout]',
  LOADED_COLLECTIONS       = '[CollectionsEvent: Loaded Collections]',
  CREATED_TEST_COLLECTION  = '[CollectionsEvent: Created Test Collection]',
}

/**
 * Event interfaces for the collection component, with their payloads.
 */
export interface ClickedLoadEvent extends EventObject { type: CollectionsEvents.CLICKED_LOAD }
export interface ClickedAddEvent extends EventObject { type: CollectionsEvents.CLICKED_ADD }
export interface ClickedLogoutEvent extends EventObject { type: CollectionsEvents.CLICKED_LOGOUT }
export interface LoadedCollectionsEvent extends EventObject { type: CollectionsEvents.LOADED_COLLECTIONS; collections: Collection[] }
export interface CreatedTestCollection extends EventObject { type: CollectionsEvents.CREATED_TEST_COLLECTION; collections: Collection[] }

/**
 * Union event type of the interfaces for the collection component.
 */
export type CollectionsEvent =
  | ClickedLoadEvent
  | ClickedAddEvent
  | ClickedLogoutEvent
  | LoadedCollectionsEvent
  | CreatedTestCollection;
