import { CollectionObjectMemoryStore, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { ObjectContext, objectMachine } from '../object.machine';
import { ObjectCreationComponent } from './object-creation.component';

describe('ObjectCreationComponent', () => {

  let component: ObjectCreationComponent;
  let machine: Interpreter<ObjectContext>;
  const tag = 'nde-object-creation';

  const object1 = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: '1',
    collection: 'collection-uri-1',
  };

  beforeEach(() => {

    const objectStore = new CollectionObjectMemoryStore([
      object1,
    ]);

    machine = interpret(objectMachine(objectStore)
      .withContext({
        object: object1,
      }));

    component = window.document.createElement(tag) as ObjectCreationComponent;
    component.actor = machine;
    component.object = object1;
    component.translator = new MemoryTranslator([], 'nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
