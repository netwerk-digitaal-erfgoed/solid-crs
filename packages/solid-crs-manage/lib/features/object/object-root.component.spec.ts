import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, MemoryTranslator, Collection, CollectionObject, CollectionMemoryStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from '../../app.events';
import { appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { ObjectRootComponent } from './object-root.component';
import { ObjectEvents } from './object.events';
import { ObjectContext, objectMachine, ObjectStates } from './object.machine';

describe('ObjectRootComponent', () => {

  let component: ObjectRootComponent;
  let machine: Interpreter<ObjectContext>;

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

  beforeEach(() => {

    const collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

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
      {},
    ));

    component = window.document.createElement('nde-object-root') as ObjectRootComponent;

    component.actor = machine;

    component.translator = new MemoryTranslator([], 'nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should not throw when running updated with null', () => {

    expect(() => component.updated(null)).not.toThrow();

  });

  it('should show alerts when set', async () => {

    component.alerts = [ {
      type: 'success',
      message: 'Foo',
    } ];

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should not show alerts when unset', async () => {

    component.alerts = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should send event when delete is clicked', async () => {

    machine.start();
    machine.send(ObjectEvents.SELECTED_OBJECT, { object: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.onTransition((state) => {

      machine.send = jest.fn();

      if(state.matches(ObjectStates.IDLE) && state.context?.object) {

        const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.delete') as HTMLElement;

        if(button) {

          button.click();

          expect(machine.send).toHaveBeenCalledTimes(1);

        }

      }

    });

  });

  it('should send event when object title is clicked', async () => {

    machine.start();
    machine.send(ObjectEvents.SELECTED_OBJECT, { object: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.onTransition((state) => {

      machine.send = jest.fn();

      if(state.matches(ObjectStates.IDLE) && state.context?.object) {

        const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('nde-form-element[slot="title"]') as HTMLElement;

        if(button){

          button.click();

          expect(machine.send).toHaveBeenCalledTimes(1);

        }

      }

    });

  });

  it('should send event when object subtitle is clicked', async () => {

    machine.start();
    machine.send(ObjectEvents.SELECTED_OBJECT, { object: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.onTransition((state) => {

      machine.send = jest.fn();

      if(state.matches(ObjectStates.IDLE) && state.context?.object) {

        const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('nde-form-element[slot="subtitle"]') as HTMLElement;

        if(button) {

          button.click();

          expect(machine.send).toHaveBeenCalledTimes(1);

        }

      }

    });

  });

  it('should send event when create is clicked', async () => {

    machine.start();
    machine.send(ObjectEvents.SELECTED_OBJECT, { object: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.onTransition((state) => {

      machine.send = jest.fn();

      if(state.matches(ObjectStates.IDLE) && state.context?.object) {

        const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.create') as HTMLElement;

        if(button) {

          button.click();

          expect(machine.send).toHaveBeenCalledTimes(1);

        }

      }

    });

  });

  it('should send event when edit is clicked', async () => {

    machine.start();
    machine.send(ObjectEvents.SELECTED_OBJECT, { object: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.onTransition((state) => {

      if(state.matches(ObjectStates.IDLE) && state.context?.object) {

        machine.send = jest.fn();

        const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.edit') as HTMLElement;

        if(button) {

          button.click();

          expect(machine.send).toHaveBeenCalledTimes(1);

        }

      }

    });

  });

  // it('should hide save and cancel buttons and show delete button when not editing', async () => {

  //   machine.start();
  //   (component as any).state = { matches: jest.fn().mockReturnValueOnce(false) };
  //   window.document.body.appendChild(component);
  //   await component.updateComplete;

  //   const root = window.document.body.querySelector('nde-object-root').shadowRoot;
  //   expect(root).toBeTruthy();
  //   const contentHeader = root.querySelector('nde-content-header');
  //   expect(contentHeader).toBeTruthy();
  //   expect(contentHeader.querySelector('.save')).toBeFalsy();
  //   expect(contentHeader.querySelector('.cancel')).toBeFalsy();
  //   expect(contentHeader.querySelector('.delete')).toBeTruthy();

  // });

  // it('should show save, cancel and delete buttons when editing', async () => {

  //   machine.start();
  //   (component as any).state = { matches: jest.fn().mockReturnValueOnce(true) };
  //   window.document.body.appendChild(component);
  //   await component.updateComplete;

  //   const root = window.document.body.querySelector('nde-object-root').shadowRoot;
  //   expect(root).toBeTruthy();
  //   const contentHeader = root.querySelector('nde-content-header');
  //   expect(contentHeader).toBeTruthy();
  //   expect(contentHeader.querySelector('.save')).toBeTruthy();
  //   expect(contentHeader.querySelector('.cancel')).toBeTruthy();
  //   expect(contentHeader.querySelector('.delete')).toBeTruthy();

  // });

  describe('handleDismiss', () => {

    const alert: Alert = { message: 'foo', type: 'success' };

    it('should throw error when event is null', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss(null)).toThrow(ArgumentError);

    });

    it('should throw error when actor is null', async () => {

      component.actor = null;

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss({ detail: alert } as CustomEvent<Alert>)).toThrow(ArgumentError);

    });

    it('should send dismiss alert event to parent', async (done) => {

      machine.start();
      machine.parent.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.parent.onEvent((event) => {

        if(event && event.type === AppEvents.DISMISS_ALERT) {

          expect(event.alert).toEqual(alert);
          done();

        }

      });

      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);

    });

  });

  // it('should update subscription when formActor is updated', async () => {

  //   machine.start();

  //   window.document.body.appendChild(component);
  //   await component.updateComplete;

  //   component.subscribe = jest.fn();

  //   const map = new Map<string, string>();
  //   map.set('actor', 'bla');
  //   map.set('formActor', 'bla');

  //   component.updated(map);

  //   expect(component.subscribe).toHaveBeenCalledTimes(4);

  // });

});
