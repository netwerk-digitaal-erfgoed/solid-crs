import { Collection } from '@digita-ai/nde-erfgoed-core';
import { assign, EventObject, send, sendParent } from 'xstate';
import { Alert } from '@digita-ai/nde-erfgoed-components';
import { CollectionsContext } from './collections.context';
import { CollectionsEvents, LoadedCollectionsEvent } from './collections.events';
import { AppEvents } from 'lib/app.events';

/**
 * Actions for the collections component.
 */

export const replaceCollections = assign({ collections: (_, event: LoadedCollectionsEvent) => event.collections });

export const addCollections = assign<CollectionsContext, EventObject & { collections: Collection[] }>({
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
