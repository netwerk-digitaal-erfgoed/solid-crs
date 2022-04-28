import { State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine } from 'xstate';
import { activeRoute, ArgumentError, Collection, CollectionObject, CollectionObjectStore, createRoute, Route, routerEventsConfig, routerStateConfig } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { log } from 'xstate/lib/actions';
import { ObjectEvent, ObjectEvents } from './object.events';

/**
 * The context of the object feature.
 */
export interface ObjectContext {
  /**
   * The currently selected object with potential edits.
   */
  object?: CollectionObject;
  /**
   * A list of all collections.
   */
  collections?: Collection[];
  /**
   * The object containing updates for the original one
   */
  updatedObject?: CollectionObject;
}

/**
 * Actor references for this machine config.
 */
export enum ObjectActors {
  OBJECT_MACHINE = 'ObjectMachine',
}

/**
 * State references for the object machine, with readable log format.
 */
export enum ObjectStates {
  ENTRY     = '[ObjectsState: Entry]',
  OVERVIEW  = '[ObjectsState: Overview]',
  COMPARE   = '[ObjectsState: Compare]',
  LOADING_COMPARE = '[ObjectsState: Loading Compare]',
}

const routes: Route[] = [
  createRoute(
    '/{{webId}}/object/{{originalObject}}/compare/{{updatedObject}}',
    [ `#${ObjectStates.COMPARE}` ],
  ),
  createRoute(
    '/{{webId}}/object/{{objectUri}}',
    [ `#${ObjectStates.OVERVIEW}` ],
  ),
];

/**
 * The object machine.
 */
export const objectMachine = (objectStore: CollectionObjectStore) =>
  createMachine<ObjectContext, ObjectEvent, State<ObjectStates, ObjectContext>>({
    id: ObjectActors.OBJECT_MACHINE,
    initial: ObjectStates.ENTRY,
    context: { },
    on: {
      [ObjectEvents.SELECTED_OBJECT]: {
        actions: [
          assign({ object: (context, event) => event.object }),
        ],
        target: ObjectStates.LOADING_COMPARE,
      },
    },
    states: {
      [ObjectStates.ENTRY]: {
        id: ObjectStates.ENTRY,
      },
      [ObjectStates.OVERVIEW]: {
        id: ObjectStates.OVERVIEW,
        entry: log(`Entered ${ObjectStates.OVERVIEW}`),
        exit: log(`Entered ${ObjectStates.OVERVIEW}`),
      },
      [ObjectStates.COMPARE]: {
        id: ObjectStates.COMPARE,
        entry: log(`Entered ${ObjectStates.COMPARE}`),
        exit: log(`Entered ${ObjectStates.COMPARE}`),
      },
      [ObjectStates.LOADING_COMPARE]: {
        entry: log(`Entered ${ObjectStates.LOADING_COMPARE}`),
        id: ObjectStates.LOADING_COMPARE,
        invoke: {
          src: async () => {

            if (window.location.pathname?.match(/^\/.+\/object\/.+?\/compare\/.+\/?$/)) {

              return objectStore.get(decodeURIComponent(activeRoute(routes).pathParams.get('updatedObject')));

            } else throw new ArgumentError('invalid URL for this state', window.location.pathname);

          },
          onDone: {
            actions: assign({ updatedObject: (c, e) => e.data }),
            target: ObjectStates.COMPARE,
          },
          onError: {
            actions: log((c, event) => event.data.message),
            target: ObjectStates.OVERVIEW,
          },
        },
      },
    },
  });
