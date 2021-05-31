import { FormElementComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObjectMemoryStore, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { ObjectEvents } from '../object.events';
import { ObjectContext, objectMachine } from '../object.machine';
import { ObjectCreationComponent } from './object-creation.component';

describe('ObjectCreationComponent', () => {

  let component: ObjectCreationComponent;
  let machine: Interpreter<ObjectContext>;

  const collection1 = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: '',
    distribution: '',
  };

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

    component = window.document.createElement('nde-object-creation') as ObjectCreationComponent;

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

  it('clicking form element should fire CLICKED_EDIT', async (done) => {

    machine.onEvent((event) => {

      if(event && event.type === ObjectEvents.CLICKED_EDIT) {

        done();

      }

    });

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    const input: FormElementComponent<string> = window.document.body.querySelector('nde-form-element');
    expect(input).toBeTruthy();
    input.click();

  });

});
