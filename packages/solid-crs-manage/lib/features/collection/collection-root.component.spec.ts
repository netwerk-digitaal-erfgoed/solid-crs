import { Alert, FormActors } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, MockTranslator, SolidMockService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents, DismissAlertEvent } from '../../app.events';
import { appMachine } from '../../app.machine';
import { CollectionRootComponent } from './collection-root.component';
import { CollectionEvents } from './collection.events';
import { CollectionContext, collectionMachine, CollectionStates } from './collection.machine';

describe('CollectionRootComponent', () => {

  let component: CollectionRootComponent;
  let machine: Interpreter<CollectionContext>;
  let collectionStore: CollectionMemoryStore;
  let objectStore: CollectionObjectMemoryStore;

  const collection1: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: null,
    distribution: null,
  };

  const collection2: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
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

  beforeEach(() => {

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1 ]);

    machine = interpret(collectionMachine(collectionStore, objectStore, object1)
      .withContext({
        collection: collection1,
        objects: [ object1 ],
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      { ...collection1 },
      { ...object1 },
    ).withContext({
      alerts: [],
      selected: collection1,
    }));

    component = window.document.createElement('nde-collection-root') as CollectionRootComponent;

    component.actor = machine;
    component.formActor = machine.children.get(FormActors.FORM_MACHINE);
    component.translator = new MockTranslator('nl-NL');

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

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should not show alerts when unset', async () => {

    component.alerts = null;

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should send event when delete is clicked', async () => {

    machine.onTransition(async(state) => {

      if(state.matches(CollectionStates.IDLE) && state.context?.collection) {

        await component.updateComplete;

        const button = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.confirm-delete') as HTMLElement;
        button.click();

        expect(machine.send).toHaveBeenCalledTimes(1);

      }

    });

    machine.start();
    machine.send(CollectionEvents.SELECTED_COLLECTION, { collection: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  // it('should call toggleDelete and show popup when cancel button is clicked', async () => {

  //   window.document.body.appendChild(component);
  //   await component.updateComplete;
  //   component.deletePopup.hidden = false;

  //   const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.cancel-delete') as HTMLElement;
  //   button.click();
  //   expect(component.deletePopup.hidden).toEqual(true);

  // });

  // it('should call toggleDelete and show popup when delete icon is clicked', async () => {

  //   window.document.body.appendChild(component);
  //   await component.updateComplete;
  //   component.deletePopup.hidden = false;

  //   const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.delete') as HTMLElement;
  //   button.click();
  //   expect(component.deletePopup.hidden).toEqual(true);

  // });

  it('should send event when collection title is clicked', async () => {

    machine.onTransition(async(state) => {

      if(state.matches(CollectionStates.IDLE) && state.context?.collection) {

        await component.updateComplete;

        const button = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('nde-form-element[slot="title"]') as HTMLElement;
        button.click();

        expect(machine.send).toHaveBeenCalledTimes(1);

      }

    });

    machine.start();
    machine.send(CollectionEvents.SELECTED_COLLECTION, { collection: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  it('should send event when collection subtitle is clicked', async () => {

    machine.onTransition(async(state) => {

      if(state.matches(CollectionStates.IDLE) && state.context?.collection) {

        await component.updateComplete;

        const button = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('nde-form-element[slot="subtitle"]') as HTMLElement;
        button.click();

        expect(machine.send).toHaveBeenCalledTimes(1);

      }

    });

    machine.start();
    machine.send(CollectionEvents.SELECTED_COLLECTION, { collection: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  it('should send event when create is clicked', async () => {

    machine.onTransition(async(state) => {

      if(state.matches(CollectionStates.IDLE) && state.context?.collection) {

        await component.updateComplete;

        const button = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.create') as HTMLElement;
        button.click();

        expect(machine.send).toHaveBeenCalledTimes(1);

      }

    });

    machine.start();
    machine.send(CollectionEvents.SELECTED_COLLECTION, { collection: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  it('should hide save and cancel buttons and show edit button when not editing', async () => {

    machine.onTransition(async (state) => {

      if(state.matches(CollectionStates.IDLE)) {

        const save = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.save') as HTMLElement;
        const cancel = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.cancel') as HTMLElement;
        const edit = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.edit') as HTMLElement;

        expect(save).toBeFalsy();
        expect(cancel).toBeFalsy();
        expect(edit).toBeTruthy();

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  it('should show save and cancel buttons and hide edit button when editing', async () => {

    machine.onTransition(async (state) => {

      if(state.matches(CollectionStates.IDLE)) {

        const edit = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.edit') as HTMLElement;

        expect(edit).toBeTruthy();

        (edit as HTMLButtonElement).click();

      }

      if (state.matches(CollectionStates.EDITING)) {

        const save = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.save') as HTMLElement;
        const cancel = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.cancel') as HTMLElement;
        const edit = window.document.body.getElementsByTagName('nde-collection-root')[0].shadowRoot.querySelector('.edit') as HTMLElement;

        expect(save).toBeTruthy();
        expect(cancel).toBeTruthy();
        expect(edit).toBeFalsy();

      }

    });

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  describe('handleDismiss', () => {

    const alert: Alert = { message: 'foo', type: 'success' };

    it('should throw error when event is null', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss(null)).toThrow(ArgumentError);

    });

    it('should throw error when actor is null', async () => {

      component.actor = null;

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(() => component.handleDismiss({ detail: alert } as CustomEvent<Alert>)).toThrow(ArgumentError);

    });

    it('should send dismiss alert event to parent', async (done) => {

      machine.parent.onEvent((event) => {

        if(event && event.type === AppEvents.DISMISS_ALERT) {

          const casted = event as DismissAlertEvent;
          expect(casted.alert).toEqual(alert);
          done();

        }

      });

      machine.start();
      machine.parent.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);

    });

  });

  it('should update subscription when formActor is updated', async () => {

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    component.subscribe = jest.fn();

    const map = new Map<string, string>();
    map.set('actor', 'bla');
    map.set('formActor', 'bla');

    component.updated(map);

    expect(component.subscribe).toHaveBeenCalledTimes(5);

  });

});
