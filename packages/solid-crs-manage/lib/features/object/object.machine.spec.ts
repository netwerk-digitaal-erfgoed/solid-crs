import { FormContext, FormUpdatedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObjectMemoryStore, CollectionObjectStore, ConsoleLogger, LoggerLevel, CollectionStore, CollectionMemoryStore, Collection, CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { ObjectEvents, SelectedObjectEvent } from './object.events';
import { ObjectContext, objectMachine, ObjectStates, validateObjectForm } from './object.machine';

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

  it('should transition to IDLE when clicked reset was emitted', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.IDLE)) {

        done();

      }

    });

    machine.start();
    machine.send(ObjectEvents.CLICKED_RESET);

  });

  it('should transition to SAVING when clicked save was emitted', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.SAVING)) {

        done();

      }

    });

    machine.start();
    machine.send(ObjectEvents.CLICKED_SAVE);

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

  describe('validateObjectForm()', () => {

    let context: FormContext<CollectionObject>;

    beforeEach(() => {

      context = {
        data: {
          description: 'description',
          name: 'name',
          identifier: 'identifier',
          dateCreated: '2021',
          type: undefined,
          collection: undefined,
          uri: undefined,
          image: undefined,
        },
        original: {
          description: 'description',
          name: 'name',
          identifier: 'identifier',
          dateCreated: '2021',
          type: undefined,
          collection: undefined,
          uri: undefined,
          image: undefined,
        },
      };

    });

    it('should return an empty list if no problems were found', async () => {

      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(0);

    });

    it('should return an error when name is an empty string', async () => {

      context.data = { ...context.data, name: '' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when name is longer than 100 characters', async () => {

      context.data = { ...context.data, name: 'a'.repeat(101) };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when type is an empty string', async () => {

      context.data = { ...context.data, type: '' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when type is not a real url', async () => {

      context.data = { ...context.data, type: 'inva/lid.com-url' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when additionalType is an empty string', async () => {

      context.data = { ...context.data, additionalType: '' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when description is longer than 10000 characters', async () => {

      context.data = { ...context.data, description: 'a'.repeat(10001) };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when identifer is an empty string', async () => {

      context.data = { ...context.data, identifier: '' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when dateCreated is a random string', async () => {

      context.data = { ...context.data, dateCreated: 'StringThatDoesNotMakeSense' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when image is an empty string', async () => {

      context.data = { ...context.data, image: '' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when image is not a real url', async () => {

      context.data = { ...context.data, image: 'StringThatDoesNotMakeSense' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it('should return an error when image is not an url to an image', async () => {

      context.data = { ...context.data, image: 'http://www.google.com' };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

    it.each([ 'depth', 'width', 'height', 'weight' ])('should error when %s is not a number', async (value) => {

      context.data = { ...context.data, [value]: NaN };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

  });

});
