import { createMachine, MachineConfig, sendParent } from 'xstate';
import { CollectionsContext } from './collections.context';
import { CollectionsEvent, CollectionsEvents } from './collections.events';
import { CollectionsState, CollectionsSchema, CollectionsStates } from './collections.states';
import { addCollections, addTestCollection, replaceCollections } from './collections.actions';
import { loadCollectionsService } from './collections.services';
import { AppEvents } from 'lib/app.events';

/**
 * Actor references for this machine config.
 */
export enum CollectionsActors {
  COLLECTIONS_MACHINE = 'CollectionMachine',
}

/**
 * The machine config for the collection component machine.
 */
const collectionsConfig: MachineConfig<CollectionsContext, CollectionsSchema, CollectionsEvent> = {
  id: 'collections',
  initial: CollectionsStates.IDLE,
  on: {
    [CollectionsEvents.LOADED_COLLECTIONS]: {
      actions: replaceCollections,
    },
    [CollectionsEvents.CREATED_TEST_COLLECTION]: {
      actions: addCollections,
    },
    [CollectionsEvents.CLICKED_ADD]: {
      actions: [
        addTestCollection,
        sendParent((context, event) => ({
          alert: {type: 'success', message: 'nde.collections.alerts.created-collection'},
          type: AppEvents.ADD_ALERT,
        })),
      ],
    },
    [CollectionsEvents.CLICKED_LOGOUT]: CollectionsStates.LOGOUT,
  },
  states: {
    [CollectionsStates.IDLE]: {
      on: {
        [CollectionsEvents.CLICKED_LOAD]: CollectionsStates.LOADING,
      },
    },
    [CollectionsStates.LOADING]: {
      invoke: {
        src: loadCollectionsService,
        onDone: CollectionsStates.IDLE,
      },
    },
    [CollectionsStates.LOGOUT]: {
      type: 'final',
    },
  },
};

/**
 * The collection component machine.
 */
export const collectionsMachine = createMachine<CollectionsContext, CollectionsEvent, CollectionsState>(collectionsConfig);
