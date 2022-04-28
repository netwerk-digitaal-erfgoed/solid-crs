import { CollectionObjectMemoryStore, CollectionObjectStore, CollectionStore, CollectionMemoryStore, Collection, CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../app.machine';
import { SelectedObjectEvent } from './object.events';
import { ObjectContext, objectMachine } from './object.machine';

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

  let machine: Interpreter<ObjectContext>;
  let collectionStore: CollectionStore;
  let objectStore: CollectionObjectStore;

  beforeEach(() => {

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1, object2 ]);

    machine = interpret(objectMachine()
      .withContext({
        object: object1,
      }));

    machine.parent = interpret(appMachine(
      collectionStore,
      objectStore,
    ));

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should assign when selected object', async () => {

    const onChangeCheck = new Promise<void>((resolve) => {

      machine.onChange((context) => {

        if(context.object?.uri === object2.uri) {

          return resolve();

        }

      });

    });

    machine.start();
    machine.send(new SelectedObjectEvent(object2));
    await expect(onChangeCheck).resolves.toBeUndefined();

  });

});
