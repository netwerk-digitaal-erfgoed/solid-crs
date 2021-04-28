import { Alert, Event } from '@digita-ai/nde-erfgoed-components';
import { Collection } from '@digita-ai/nde-erfgoed-core';
import { assign, EventObject, send, sendParent } from 'xstate';
import { AppEvents } from '../../app.events';
import { CollectionsContext } from './collections.machine';

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
export interface ClickedLoadEvent extends Event<CollectionsEvents> { type: CollectionsEvents.CLICKED_LOAD }
export interface ClickedAddEvent extends Event<CollectionsEvents> { type: CollectionsEvents.CLICKED_ADD }
export interface ClickedLogoutEvent extends Event<CollectionsEvents> { type: CollectionsEvents.CLICKED_LOGOUT }
export interface LoadedCollectionsEvent extends Event<CollectionsEvents> { type: CollectionsEvents.LOADED_COLLECTIONS; collections: Collection[] }
export interface CreatedTestCollection extends Event<CollectionsEvents> { type: CollectionsEvents.CREATED_TEST_COLLECTION; collections: Collection[] }

/**
 * Actions for the collections component.
 */

export const replaceCollections = assign<CollectionsContext, Event<CollectionsEvents> & { collections: Collection[] }>({
  collections: (_, event: LoadedCollectionsEvent) => event.collections,
});

export const addCollections = assign<CollectionsContext, Event<CollectionsEvents> & { collections: Collection[] }>({
  collections: (context, event) => [ ... context.collections ?? [], ... event.collections ],
});

export const addTestCollection = send((context: CollectionsContext) => ({ type: CollectionsEvents.CREATED_TEST_COLLECTION, collections: [ {
  name: `Test Collection ${ 1 + (context.collections?.length ?? 0) }`,
  uri: 'urn:example:nde:collections:test',
} ] }));

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
