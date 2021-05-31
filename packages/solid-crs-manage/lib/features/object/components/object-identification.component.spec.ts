import { CollectionMemoryStore, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../../app.machine';
import { SolidMockService } from '../../../common/solid/solid-mock.service';
import { SearchContext } from '../../search/search.machine';
import { ObjectRootComponent } from '../object-root.component';
import { objectMachine } from '../object.machine';
import { ObjectIdentificationComponent } from './object-identification.component';

describe('ObjectIdentificationComponent', () => {

  let component: ObjectIdentificationComponent;
  let machine: Interpreter<SearchContext>;
  const tag = 'nde-object-identification';

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

    const collectionStore = new CollectionMemoryStore([ collection1 ]);

    const objectStore = new CollectionObjectMemoryStore([
      object1,
    ]);

    machine = interpret(objectMachine(objectStore)
      .withContext({
        object: object1,
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      collection1,
      object1,
    ));

    component = window.document.createElement(tag) as ObjectRootComponent;
    component.actor = machine;
    component.translator = new MemoryTranslator([], 'nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
