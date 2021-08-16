import { FormActors, FormContext, FormSubmittedEvent, FormUpdatedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObjectMemoryStore, CollectionObjectStore, ConsoleLogger, LoggerLevel, CollectionStore, CollectionMemoryStore, Collection, CollectionObject, SolidMockService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../app.machine';
import { ClickedDeleteObjectEvent, ClickedObjectSidebarItem, ClickedResetEvent, ClickedTermFieldEvent, SelectedObjectEvent } from './object.events';
import { ObjectContext, objectMachine, ObjectStates, validateObjectForm } from './object.machine';
import { ClickedSubmitEvent } from './terms/term.events';
import { TermActors, TermContext, TermStates } from './terms/term.machine';

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
    updated: '0',
    collection: 'collection-uri-1',
  };

  const object2: CollectionObject = {
    uri: 'object-uri-2',
    name: 'Object 2',
    description: 'This is object 2',
    image: null,
    type: null,
    updated: '0',
    collection: 'collection-uri-1',
    additionalType: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    creator: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    locationCreated: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    material: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    subject: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    location: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    person: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    organization: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
    event: [ { name: 'bidprentjes', uri: 'https://test.uri/' } ],
  };

  const termService = {
    getSources: jest.fn(async() => []),
  };

  let machine: Interpreter<ObjectContext>;
  let collectionStore: CollectionStore;
  let objectStore: CollectionObjectStore;

  beforeEach(() => {

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1, object2 ]);

    machine = interpret(objectMachine(objectStore)
      .withContext({
        object: object1,
        termService,
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      collection1,
      object1,
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
    machine.send(new ClickedResetEvent());

  });

  it('should transition to SAVING when form machine exits', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.SAVING)) {

        done();

      }

    });

    machine.start();
    const formMachine = machine.children.get(FormActors.FORM_MACHINE) as Interpreter<FormContext<unknown>>;
    expect(formMachine).toBeTruthy();
    formMachine.send(new FormUpdatedEvent('field', 'value'));
    formMachine.send(new FormSubmittedEvent());

  });

  it('should transition to IDLE when term machine exits', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.IDLE)) {

        done();

      }

      if(state.matches(ObjectStates.EDITING_FIELD)) {

        const termMachine = machine.children.get(TermActors.TERM_MACHINE) as Interpreter<TermContext>;
        expect(termMachine).toBeTruthy();

        termMachine.onTransition((termState) => {

          if (termState.matches(TermStates.IDLE)) {

            termMachine.send(new ClickedSubmitEvent());

          }

        });

      }

    });

    machine.start();
    machine.send(new ClickedTermFieldEvent('field', [ { name: 'test', uri: 'test' } ]));

  });

  it('should send error to parent when term machine errors', async () => {

    machine = interpret(objectMachine(objectStore)
      .withContext({
        object: object1,
        termService: { getSources: jest.fn().mockRejectedValueOnce('error') },
      }));

    machine.parent = {
      send: jest.fn(),
    } as any;

    machine.onTransition((state) => {

      let passedTermMachine = false;

      if(passedTermMachine && state.matches(ObjectStates.IDLE)) {

        expect(machine.parent.parent.send).toHaveBeenCalledTimes(1);

      }

      if(state.matches(ObjectStates.EDITING_FIELD)) {

        passedTermMachine = true;

      }

    });

    machine.start();
    machine.send(new ClickedTermFieldEvent('field', [ { name: 'test', uri: 'test' } ]));

  });

  it('should transition to IDLE when CLICKED_SIDEBAR_ITEM', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.IDLE) && state.event instanceof ClickedObjectSidebarItem) {

        done();

      }

      if(state.matches(ObjectStates.EDITING_FIELD)) {

        machine.send(new ClickedObjectSidebarItem('itemid'));

      }

    });

    machine.start();
    machine.send(new ClickedTermFieldEvent('field', [ { name: 'test', uri: 'test' } ]));

  });

  it('should transition to EDITING_FIELD when CLICKED_TERM_FIELD was fired', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.EDITING_FIELD)) {

        done();

      }

    });

    machine.start();
    machine.send(new ClickedTermFieldEvent('name', [ { name: 'test', uri: 'test' } ]));

  });

  it('should transition to deleting when clicked edit was emitted', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.DELETING)) {

        done();

      }

    });

    machine.start();
    machine.send(new ClickedDeleteObjectEvent(object1));

  });

  it('should send error to parent when deleting threw error', () => {

    objectStore.delete = jest.fn().mockRejectedValueOnce('error');

    machine.parent = {
      send: jest.fn(),
    } as any;

    let passedDelete = false;

    machine.onTransition((state) => {

      if(passedDelete && state.matches(ObjectStates.IDLE)) {

        expect(machine.parent.send).toHaveBeenCalledTimes(1);

      }

      if(state.matches(ObjectStates.DELETING)) {

        passedDelete = true;

      }

    });

    machine.start();
    machine.send(new ClickedDeleteObjectEvent(object1));

  });

  it('should save object when saving', async (done) => {

    objectStore.save = jest.fn().mockResolvedValueOnce(object1);

    machine.start();
    machine.send(new SelectedObjectEvent(object1));

    let alreadySaved = false;

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.SAVING)) {

        alreadySaved = true;

      }

      if(alreadySaved && state.matches(ObjectStates.IDLE) && state.context?.object) {

        expect(objectStore.save).toHaveBeenCalledTimes(1);

        expect(objectStore.save).toHaveBeenCalledWith(expect.objectContaining({ ...object1, name: 'test' }));

        done();

      } else if (state.matches(ObjectStates.IDLE) && machine.children.get(FormActors.FORM_MACHINE)) {

        machine.children.get(FormActors.FORM_MACHINE).send(new FormUpdatedEvent('name', 'test'));
        machine.children.get(FormActors.FORM_MACHINE).send(new FormSubmittedEvent());

      }

    });

  });

  it('should send error to parent when saving threw error', (done) => {

    objectStore.save = jest.fn().mockRejectedValueOnce('error');

    machine.start();
    machine.send(new SelectedObjectEvent(object1));

    machine.parent = {
      send: jest.fn(),
    } as any;

    let alreadySaved = false;

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.SAVING)) {

        alreadySaved = true;

      }

      if(alreadySaved && state.matches(ObjectStates.IDLE) && state.context?.object) {

        expect(machine.parent.send).toHaveBeenCalledWith(expect.objectContaining({ data: 'error' }));
        done();

      } else if (state.matches(ObjectStates.IDLE) && machine.children.get(FormActors.FORM_MACHINE)) {

        machine.children.get(FormActors.FORM_MACHINE).send(new FormUpdatedEvent('name', 'test'));
        machine.children.get(FormActors.FORM_MACHINE).send(new FormSubmittedEvent());

      }

    });

  });

  it('should assign when selected object', async (done) => {

    machine.onChange((context) => {

      if(context.object?.uri === object2.uri) {

        done();

      }

    });

    machine.start();

    machine.send(new SelectedObjectEvent(object2));

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

    it('should return an error when additionalType is an empty list', async () => {

      context.data = { ...context.data, additionalType: [] };
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

    it.each([ 'depth', 'width', 'height', 'weight' ])('should error when %s is not a number', async (value) => {

      context.data = { ...context.data, [value]: NaN };
      const res = validateObjectForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

  });

});
