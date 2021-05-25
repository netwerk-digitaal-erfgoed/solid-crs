import { formMachine,
  FormActors,
  FormValidatorResult,
  FormContext,
  FormEvents, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Observable, of } from 'rxjs';
import { AppEvents } from '../../app.events';
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
  SAVING    = '[CollectionsState: Saving]',
  EDITING   = '[CollectionsState: Editing]',
  DELETING  = '[CollectionsState: Deleting]',
  DETERMINING_COLLECTION  = '[CollectionsState: Determining collection]',
}

/**
 * The collection machine.
 */
export const collectionMachine = (collectionStore: CollectionStore, objectStore: CollectionObjectStore) =>
  createMachine<CollectionContext, CollectionEvent, State<CollectionStates, CollectionContext>>({
    id: CollectionActors.COLLECTION_MACHINE,
    context: { },
    initial: CollectionStates.DETERMINING_COLLECTION,
    on: {
      [CollectionEvents.CLICKED_EDIT]: CollectionStates.EDITING,
      [CollectionEvents.CLICKED_DELETE]: CollectionStates.DELETING,
      [CollectionEvents.CLICKED_SAVE]: CollectionStates.SAVING,
      [CollectionEvents.CANCELLED_EDIT]: CollectionStates.IDLE,
      [CollectionEvents.SELECTED_COLLECTION]: {
        actions: assign({
          collection: (context, event) => event.collection,
        }),
        target: CollectionStates.DETERMINING_COLLECTION,
      },
    },
    states: {
      /**
       * Loads the objects associated with the current collection.
       */
      [CollectionStates.LOADING]: {
        invoke: {
          src: (context) =>
            objectStore.getObjectsForCollection(context.collection),
          onDone: {
            /**
             * When done, assign objects to the context and transition to idle.
             */
            actions: assign({
              objects: (context, event) => event.data,
            }),
            target: CollectionStates.IDLE,
          },
          onError: {
            /**
             * Notify the parent machine when something goes wrong.
             */
            actions: sendParent((context, event) => ({ type: AppEvents.ERROR, data: event.data })),
          },
        },
      },
      /**
       * Determining collection
       */
      [CollectionStates.DETERMINING_COLLECTION]: {
        always: [
          {
            target: CollectionStates.LOADING,
            cond: (context, event) => context?.collection ? true : false,
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
      /**
       * Saving changesto the collection's metadata.
       */
      [CollectionStates.SAVING]: {
        invoke: {
          src: (context) => collectionStore.save(context.collection),
          onDone: {
            target: CollectionStates.DETERMINING_COLLECTION,
            actions: [
              sendParent(() => ({ type: CollectionEvents.SAVED_COLLECTION })),
            ],
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
      /**
       * Editing the collection metadata.
       */
      [CollectionStates.EDITING]: {
        invoke: [
          /**
           * Invoke a form machine which controls the form.
           */
          {
            id: FormActors.FORM_MACHINE,
            src: formMachine<{ name: string; description: string }>(
              (): Observable<FormValidatorResult[]> => of([]),
              async (c: FormContext<{ name: string; description: string }>) => c.data
            ),
            data: (context) => ({
              data: { name: context.collection.name, description: context.collection.description },
              original: { name: context.collection.name, description: context.collection.description },
            }),
            onDone: {
              target: CollectionStates.SAVING,
              actions: [
                assign((context, event) => ({
                  collection: {
                    ...context.collection,
                    name: event.data.data.name,
                    description: event.data.data.description,
                  },
                })),
              ],
            },
            onError: {
              target: CollectionStates.IDLE,
            },
          },
        ],
        on: {
          [FormEvents.FORM_SUBMITTED]: CollectionStates.SAVING,
        },
      },
      /**
       * Deleting the current collection.
       */
      [CollectionStates.DELETING]: {
        invoke: {
          src: (context) => collectionStore.delete(context.collection),
          onDone: {
            target: CollectionStates.IDLE,
            actions: [
              sendParent((context) => ({ type: CollectionEvents.CLICKED_DELETE, collection: context.collection })),
            ],
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
    },
  });
