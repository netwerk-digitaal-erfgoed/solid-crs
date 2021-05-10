import { formMachine,
  FormActors,
  FormValidatorResult,
  FormContext,
  FormEvents, State } from '@digita-ai/nde-erfgoed-components';
import { assign, createMachine, send, sendParent, StateMachine } from 'xstate';
import {
  Collection,
  CollectionObject,
  CollectionObjectStore,
  Store,
} from '@digita-ai/nde-erfgoed-core';

import { catchError, map } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { AppEvents } from '../../app.events';
import { CollectionEvent, CollectionEvents } from './collection.events';

/**
 * The context of a collections feature.
 */
export interface CollectionContext {
  /**
   * The currently selected collection.
   */
  collection: Collection;

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
 * State references for the collection component, with readable log format.
 */
export enum CollectionStates {
  IDLE = '[CollectionsState: Idle]',
  LOADING = '[CollectionsState: Loading]',
  SAVING = '[CollectionsState: Saving]',
  EDITING = '[CollectionsState: Editing]',
  DELETING = '[CollectionsState: Deleting]',
}

/**
 * The collection component machine.
 */
export const collectionMachine = (
  collectionStore: Store<Collection>,
  objectStore: CollectionObjectStore
) =>
  createMachine<
  CollectionContext,
  CollectionEvent,
  State<CollectionStates, CollectionContext>
  >({
    id: CollectionActors.COLLECTION_MACHINE,
    initial: CollectionStates.LOADING,
    on: {
      [CollectionEvents.CLICKED_EDIT]: CollectionStates.EDITING,
      [CollectionEvents.CLICKED_DELETE]: CollectionStates.DELETING,
      [CollectionEvents.CLICKED_SAVE]: CollectionStates.SAVING,
      [CollectionEvents.CANCELLED_EDIT]: CollectionStates.IDLE,
      [AppEvents.SELECTED_COLLECTION]: CollectionStates.LOADING,
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
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
      /**
       * Objects for the current collection are loaded.
       */
      [CollectionStates.IDLE]: {},
      /**
       * Saving changesto the collection's metadata.
       */
      [CollectionStates.SAVING]: {
        invoke: {
          src: (context) => collectionStore.save(context.collection),
          onDone: {
            target: CollectionStates.IDLE,
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
              (_: any): Observable<FormValidatorResult[]> => of([]),
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
            /**
             * Go back to unauthenticated when something goes wrong, and show an alert.
             */
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
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
    },
  });
