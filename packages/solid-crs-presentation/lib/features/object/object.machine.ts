import { formMachine, FormActors, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine } from 'xstate';
import { Collection, CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';
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
  IDLE      = '[ObjectsState: Idle]',
}

/**
 * The object machine.
 */
export const objectMachine = () =>
  createMachine<ObjectContext, ObjectEvent, State<ObjectStates, ObjectContext>>({
    id: ObjectActors.OBJECT_MACHINE,
    context: { },
    initial: ObjectStates.IDLE,
    on: {
      [ObjectEvents.SELECTED_OBJECT]: {
        actions: assign({
          object: (context, event) => event.object,
        }),
        target: ObjectStates.IDLE,
      },
    },
    states: {
      [ObjectStates.IDLE]: {
        invoke: [
          {
            id: FormActors.FORM_MACHINE,
            src: formMachine<CollectionObject>(),
            data: (context) => {

              // replace Terms with lists of uri
              // form machine can only handle (lists of) strings, not objects (Terms)
              const parseObject = (object: CollectionObject) => ({
                ...object,
                additionalType: object?.additionalType
                  ? object.additionalType.map((term) => term.uri) : undefined,
                creator: object?.creator ? object.creator.map((term) => term.uri) : undefined,
                locationCreated: object?.locationCreated
                  ? object.locationCreated.map((term) => term.uri) : undefined,
                material: object?.material ? object.material.map((term) => term.uri) : undefined,
                subject: object?.subject ? object.subject.map((term) => term.uri) : undefined,
                location: object?.location ? object.location.map((term) => term.uri) : undefined,
                person: object?.person ? object.person.map((term) => term.uri) : undefined,
                organization: object?.organization ? object.organization.map((term) => term.uri) : undefined,
                event: object?.event ? object.event.map((term) => term.uri) : undefined,
              });

              return {
                data: { ... parseObject(context.object) },
                original: { ... parseObject(context.object) },
              };

            },
          },
        ],
      },
    },
  });
