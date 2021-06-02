import { FormElementComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { CollectionObjectMemoryStore, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { RxLitElement } from 'rx-lit';
import { interpret, Interpreter } from 'xstate';
import { ObjectEvents } from '../object.events';
import { ObjectContext, objectMachine, ObjectStates } from '../object.machine';

describe.each([
  [ 'ObjectCreationComponent', 'nde-object-creation' ],
  [ 'ObjectDimensionsComponent', 'nde-object-dimensions' ],
  [ 'ObjectIdentificationComponent', 'nde-object-identification' ],
  [ 'ObjectImageryComponent', 'nde-object-imagery' ],
  [ 'ObjectRepresentationComponent', 'nde-object-representation' ],
])('%s', (name, tag) => {

  let component: RxLitElement;
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

    component = window.document.createElement(tag) as RxLitElement;

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

  // it('clicking form element input should fire CLICKED_EDIT', async (done) => {

  //   machine.onEvent((event) => {

  //     if(event && event.type === ObjectEvents.CLICKED_EDIT) {

  //       done();

  //     }

  //   });

  //   const machineSpy = jest.spyOn(machine, 'send');
  //   machine.start();
  //   window.document.body.appendChild(component);
  //   await component.updateComplete;

  //   const shadowRoot = window.document.body.querySelector(tag).shadowRoot;
  //   const firstFormElement: FormElementComponent<string> = shadowRoot.querySelector('nde-form-element');
  //   const input = firstFormElement.querySelector('input');

  //   expect(shadowRoot).toBeTruthy();
  //   expect(firstFormElement).toBeTruthy();
  //   expect(input).toBeTruthy();

  //   input.click();

  //   expect(machineSpy).toHaveBeenCalledTimes(1);

  // });

  // it('should not send CLICKED_EDIT when boolean editing is true', async () => {

  //   const machineSpy = jest.spyOn(machine, 'send');
  //   machine.start();
  //   component.state = { matches: jest.fn().mockReturnValue(true) };
  //   window.document.body.appendChild(component);
  //   await component.updateComplete;

  //   const shadowRoot = window.document.body.querySelector(tag).shadowRoot;
  //   const firstFormElement: FormElementComponent<string> = shadowRoot.querySelector('nde-form-element');
  //   const input = firstFormElement.querySelector('input');

  //   expect(shadowRoot).toBeTruthy();
  //   expect(firstFormElement).toBeTruthy();
  //   expect(input).toBeTruthy();

  //   input.click();

  //   expect(machineSpy).toHaveBeenCalledTimes(0);

  // });

  it('should not render anything when object is undefined', async () => {

    component.object = undefined;
    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.querySelector(tag)).toBeTruthy();
    expect(window.document.body.querySelector('nde-large-card')).toBeFalsy();

  });

});

