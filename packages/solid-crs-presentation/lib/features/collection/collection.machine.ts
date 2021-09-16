import { State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { AppEvents, ErrorEvent } from '../../app.events';
import { ObjectEvents } from '../object/object.events';
import { CollectionEvent, CollectionEvents } from './collection.events';

/**
 * The context of the collection feature.
 */
export interface CollectionContext {
  /**
   * The currently selected collection.
   */
  collection?: Collection;

  /**
   * The list of objects in the current collection.
   */
  objects?: CollectionObject[];
}

/**
 * Actor references for this machine config.
 */
export enum CollectionActors {
  COLLECTION_MACHINE = 'CollectionMachine',
}

/**
 * State references for the collection machine, with readable log format.
 */
export enum CollectionStates {
  IDLE      = '[CollectionsState: Idle]',
  LOADING   = '[CollectionsState: Loading]',
  DETERMINING_COLLECTION  = '[CollectionsState: Determining collection]',
}

/**
 * The collection machine.
 */
export const collectionMachine =
  (objectStore: CollectionObjectStore) =>
    createMachine<CollectionContext, CollectionEvent, State<CollectionStates, CollectionContext>>({
      id: CollectionActors.COLLECTION_MACHINE,
      context: { },
      initial: CollectionStates.DETERMINING_COLLECTION,
      on: {
        [CollectionEvents.SELECTED_COLLECTION]: [ {
          actions: assign({
            collection: (context, event) => event.collection,
          }),
          target: CollectionStates.DETERMINING_COLLECTION,
          cond: (context, event) => event.collection?.uri !== context.collection?.uri,
        } ],
      },
      states: {
      /**
       * Loads the objects associated with the current collection.
       */
        [CollectionStates.LOADING]: {

          invoke: {
            src: (context) => objectStore.getObjectsForCollection(context.collection),
            onError: {
              /**
               * Notify the parent machine when something goes wrong.
               */
              target: CollectionStates.IDLE,
              actions: (context, event) => sendParent(new ErrorEvent(event.data)),
            },
            onDone: {
            /**
             * When done, assign objects to the context and transition to idle.
             */
              actions: assign({
                objects: (context, event) => event.data.sort(
                  (a: CollectionObject, b: CollectionObject) => a.name?.localeCompare(b.name)
                ),
              }),
              target: CollectionStates.IDLE,
            },
          },
        },
        /**
         * Determining collection
         */
        [CollectionStates.DETERMINING_COLLECTION]: {
          always: [
            {
              // only load object when the current collection's disctribution does
              // not match the context's objects (== new collection selected)
              target: CollectionStates.LOADING,
              cond: (context, event) =>
                context.collection
                  && (
                    !!context.objects
                    || !context.objects?.length
                    || context.objects[0].collection !== context.collection.uri
                  ),
            },
            {
              target: CollectionStates.IDLE,
            },
          ],
        },
        /**
         * Objects for the current collection are loaded.
         */
        [CollectionStates.IDLE]: {
          on: {
            [ObjectEvents.SELECTED_OBJECT]: {
              actions: sendParent((context, event) => event),
            },
          },
        },
      },
    });
