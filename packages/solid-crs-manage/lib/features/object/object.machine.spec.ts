import { CollectionObjectMemoryStore, CollectionObjectStore, ConsoleLogger, LoggerLevel, CollectionStore, CollectionMemoryStore, Collection, CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { ObjectEvents, SelectedObjectEvent } from './object.events';
import { ObjectContext, objectMachine, ObjectStates } from './object.machine';

describe('ObjectMachine', () => {

  const collection1: Collection = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    objectsUri: null,
    distribution: null,
  };

  const collection2: Collection = {
    uri: 'object-uri-2',
    name: 'Object 2',
    description: 'This is object 2',
    objectsUri: null,
    distribution: null,
  };

  const object1: CollectionObject = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: 0,
    collection: 'collection-uri-1',
  };

  const object2: CollectionObject = {
    uri: 'object-uri-2',
    name: 'Object 2',
    description: 'This is object 2',
    image: null,
    subject: null,
    type: null,
    updated: 0,
    collection: 'collection-uri-1',
  };

  let machine: Interpreter<ObjectContext>;
  let collectionStore: CollectionStore;
  let objectStore: CollectionObjectStore;

  beforeEach(() => {

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1, object2 ]);

    machine = interpret<ObjectContext>(objectMachine(objectStore)
      .withContext({
        object: object1,
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      {}
    ));

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should transition to editing when clicked edit was emitted', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.EDITING)) {

        done();

      }

    });

    machine.start();
    machine.send(ObjectEvents.CLICKED_EDIT);

  });

  it('should transition to deleting when clicked edit was emitted', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.DELETING)) {

        done();

      }

    });

    machine.start();
    machine.send(ObjectEvents.CLICKED_DELETE);

  });

  it('should save object when saving', async (done) => {

    objectStore.save = jest.fn().mockResolvedValueOnce(object1);

    machine.start();
    machine.send(ObjectEvents.SELECTED_OBJECT, { object: object1 });

    let alreadySaved = false;

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.SAVING)) {

        alreadySaved = true;

      }

      if(alreadySaved && state.matches(ObjectStates.IDLE) && state.context?.object) {

        expect(objectStore.save).toHaveBeenCalledTimes(1);

        expect(objectStore.save).toHaveBeenCalledWith(object1);

        done();

      }

    });

    machine.send(ObjectEvents.CLICKED_EDIT);
    machine.send(ObjectEvents.CLICKED_SAVE);

  });

  it('should assign when selected object', async (done) => {

    machine.onChange((context) => {

      if(context.object?.uri === object2.uri) {

        done();

      }

    });

    machine.start();

    machine.send({ type: ObjectEvents.SELECTED_OBJECT, object: object2 } as SelectedObjectEvent);

  });

});
