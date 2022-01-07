/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { Alert, FormUpdatedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, Collection, CollectionObject, CollectionMemoryStore, Term, SolidMockService, MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectImageryComponent } from '@netwerk-digitaal-erfgoed/solid-crs-semcom-components';
import { interpret, Interpreter } from 'xstate';
import { AppEvents, DismissAlertEvent } from '../../app.events';
import { appMachine } from '../../app.machine';
import { ObjectRootComponent } from './object-root.component';
import { ClickedResetEvent, ClickedTermFieldEvent, ObjectEvents } from './object.events';
import { ObjectContext, objectMachine, ObjectStates } from './object.machine';

describe('ObjectRootComponent', () => {

  let component: ObjectRootComponent;
  let machine: Interpreter<ObjectContext>;

  const collection1: Collection = {
    uri: 'https://collection.uri-1/',
    name: 'Object 1',
    description: 'This is object 1',
    objectsUri: null,
    distribution: null,
  };

  const collection2: Collection = {
    uri: 'https://collection.uri-2/',
    name: 'Object 2',
    description: 'This is object 2',
    objectsUri: null,
    distribution: null,
  };

  const object1: CollectionObject = {
    uri: 'https://object.uri-1/',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: '0',
    collection: 'https://collection.uri-1/',
  };

  beforeEach(() => {

    jest.restoreAllMocks();

    const collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    const objectStore = new CollectionObjectMemoryStore([
      object1,
    ]);

    const termService = {
      endpoint: 'https://endpoint.url/',
      queryComponents: jest.fn(async() => []),
      getSources: jest.fn(async() => []),
    };

    machine = interpret(objectMachine(objectStore)
      .withContext({
        object: object1,
        collections: [ collection1, collection2 ],
        termService: termService as any,
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      { ...collection1 },
      { ...object1 },
    ).withContext({
      collections: [ collection1, collection2 ],
      alerts: [],
    }));

    component = window.document.createElement('nde-object-root') as ObjectRootComponent;

    component.actor = machine;

    component.translator = new MockTranslator('nl-NL');

    component.object = object1;

    component.collections = [ collection1, collection2 ];

    component.formCards = [];

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
    expect(alerts.length).toBe(1);

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

        const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.confirm-delete') as HTMLElement;

        if(button) {

          button.click();

          expect(machine.send).toHaveBeenCalledTimes(1);

        }

      }

    });

  });

  it('should call toggleDelete and show popup when cancel button is clicked', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.deletePopup.hidden = false;

    const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.cancel-delete') as HTMLElement;
    button.click();
    expect(component.deletePopup.hidden).toEqual(true);

  });

  it('should call toggleDelete and show popup when delete icon is clicked', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.deletePopup.hidden = false;

    const button = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.delete') as HTMLElement;
    button.click();
    expect(component.deletePopup.hidden).toEqual(true);

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

  it('should not show save and cancel buttons when form is not dirty', async () => {

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const save = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.save') as HTMLElement;
    const reset = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.reset') as HTMLElement;

    expect(save).toBeFalsy();
    expect(reset).toBeFalsy();

  });

  it('should show save and cancel buttons when form is dirty', async () => {

    machine.start();
    machine.send(ObjectEvents.SELECTED_OBJECT, { object: collection1 });

    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.onTransition(async(state) => {

      if(state.matches(ObjectStates.IDLE) && state.context?.object) {

        component.isDirty = true;
        component.isValid = true;
        await component.updateComplete;

        const save = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.save') as HTMLElement;
        const reset = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('.reset') as HTMLElement;

        expect(save).toBeTruthy();
        expect(reset).toBeTruthy();

        machine.send = jest.fn();
        component.formActor.send = jest.fn();

        save.click();
        reset.click();

        expect(machine.send).toHaveBeenCalledTimes(1);
        expect(component.formActor.send).toHaveBeenCalledTimes(1);

      }

    });

  });

  it('should send ClickedTermFieldEvent when CLICKED_TERM_FIELD event is caught', async () => {

    machine.start();
    machine.parent.start();
    machine.send = jest.fn();

    window.document.body.appendChild(component);
    await component.updateComplete;

    component.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>(
      'CLICKED_TERM_FIELD',
      { bubbles: true, composed: true, detail: { field: 'additionalType', terms: [] } }
    ));

    expect(machine.send).toHaveBeenCalledWith(new ClickedTermFieldEvent('additionalType', []));

  });

  it('should show content when formCards is set', async () => {

    window.document.body.appendChild(component);

    customElements.define('nde-object-imagery', ObjectImageryComponent);
    const div = document.createElement('nde-object-imagery') as ObjectImageryComponent;
    div.id = 'object.sidebar.image';

    component.formCards = [ div ];
    await component.updateComplete;

    const sidebar = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar nde-sidebar');
    const formContent = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar div.content');
    const termSearch = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar nde-term-search');
    expect(sidebar).toBeTruthy();
    expect(formContent).toBeTruthy();
    expect(termSearch).toBeFalsy();

  });

  it('should show term search when editing term field', async () => {

    window.document.body.appendChild(component);

    // customElements.define('nde-object-imagery', ObjectImageryComponent);
    const div = document.createElement('nde-object-imagery') as ObjectImageryComponent;
    div.id = 'object.sidebar.image';

    component.formCards = [ div ];
    component.isEditingTermField = true;
    await component.updateComplete;

    const sidebar = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar nde-sidebar');
    const formContent = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar div.content');
    const termSearch = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar nde-term-search');
    expect(sidebar).toBeTruthy();
    expect(formContent).toBeFalsy();
    expect(termSearch).toBeTruthy();

  });

  it('should hide content when formCards is undefined', async () => {

    window.document.body.appendChild(component);

    component.formCards = undefined;
    await component.updateComplete;

    const sidebar = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar nde-sidebar');
    const formContent = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar div.content');
    const termSearch = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content-and-sidebar nde-term-search');
    expect(sidebar).toBeFalsy();
    expect(formContent).toBeFalsy();
    expect(termSearch).toBeFalsy();

  });

  it('should prevent contextmenu events from being propagated on macos chrome', async () => {

    Object.defineProperty(window, 'navigator', {
      value: { userAgent: '... Macintosh ... Chrome/ ...' },
      writable: true,
    });

    window.eval = jest.fn(() => ObjectImageryComponent);
    customElements.define = jest.fn(() => ObjectImageryComponent);

    component.components = [
      {
        description: 'Digita SemCom component voor beeldmateriaal informatie.',
        label: 'Erfgoedobject Beeldmateriaal',
        uri: 'http://localhost:3004/object-imagery.component.js',
        shapes: [ 'http://xmlns.com/foaf/0.1/PersonalProfileDocument' ],
        author: 'https://digita.ai',
        tag: 'nde-object-imagery',
        version: '0.1.0',
        latest: true,
      },
    ];

    window.document.body.appendChild(component);
    await component.updateComplete;
    await component.registerComponents(component.components);
    await component.createComponents(component.components);

    const event = new MouseEvent('contextmenu');
    event.stopPropagation = jest.fn();
    event.preventDefault = jest.fn();
    component.formCards[0].dispatchEvent(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

  });

  describe('registerComponents()', () => {

    it('should create customElements for this.components', async () => {

      window.eval = jest.fn(() => ObjectImageryComponent);
      customElements.define = jest.fn(() => ObjectImageryComponent);

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      component.components = [
        {
          description: 'Digita SemCom component voor beeldmateriaal informatie.',
          label: 'Erfgoedobject Beeldmateriaal',
          uri: 'http://localhost:3004/object-imagery.component.js',
          shapes: [ 'http://xmlns.com/foaf/0.1/PersonalProfileDocument' ],
          author: 'https://digita.ai',
          tag: 'nde-object-imagery',
          version: '0.1.0',
          latest: true,
        },
        {
          description: 'Digita SemCom component voor identificatie informatie.',
          label: 'Erfgoedobject Identificatie',
          uri: 'http://localhost:3004/object-identification.component.js',
          shapes: [ 'http://xmlns.com/foaf/0.1/PersonalProfileDocument' ],
          author: 'https://digita.ai',
          tag: 'nde-object-identification',
          version: '0.1.0',
          latest: true,
        },
        {
          description: 'Digita SemCom component voor vervaardiging informatie.',
          label: 'Erfgoedobject Vervaardiging',
          uri: 'http://localhost:3004/object-creation.component.js',
          shapes: [ 'http://xmlns.com/foaf/0.1/PersonalProfileDocument' ],
          author: 'https://digita.ai',
          tag: 'nde-object-creation',
          version: '0.1.0',
          latest: true,
        },
        {
          description: 'Digita SemCom component voor voorstellingsinformatie.',
          label: 'Erfgoedobject Voorstelling',
          uri: 'http://localhost:3004/object-representation.component.js',
          shapes: [ 'http://digita.ai/voc/input#input' ],
          author: 'https://digita.ai',
          tag: 'nde-object-representation',
          version: '0.1.0',
          latest: true,
        },
        {
          description: 'Digita SemCom component voor afmeting informatie.',
          label: 'Erfgoedobject Afmetingen',
          uri: 'http://localhost:3004/object-dimensions.component.js',
          shapes: [ 'http://digita.ai/voc/payslip#payslip' ],
          author: 'https://digita.ai',
          tag: 'nde-object-dimensions',
          version: '0.1.0',
          latest: true,
        },
      ];

      await component.registerComponents(component.components);

    });

  });

  describe('updateSelected()', () => {

    it('should set this.visibleCard to the currently visible card', async () => {

      const div = document.createElement('div');
      div.id = 'object.sidebar.image';

      (component.formCards as any) = [ div ];

      component.updateSelected();

      expect(component.visibleCard).toBeTruthy();
      expect(component.visibleCard).toEqual(component.formCards[0].id);

    });

  });

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

    it('should send dismiss alert event to parent', async () => {

      machine.start();
      machine.parent.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.parent.send = jest.fn();

      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);
      expect(machine.parent.send).toHaveBeenCalledWith(new DismissAlertEvent(alert));

    });

  });

  describe('updated()', () => {

    it('should restart formMachine when clicked reset', async() => {

      machine.start();
      window.document.body.appendChild(component);
      component.initFormMachine = jest.fn();
      component.createComponents = jest.fn();

      await component.updateComplete;

      const map = new Map<string, string>();
      map.set('actor', 'test');
      map.set('formActor', 'test');

      await component.updated(map);

      machine.send(new ClickedResetEvent());

      expect(component.initFormMachine).toHaveBeenCalledTimes(5);
      expect(component.createComponents).toHaveBeenCalledTimes(2);

    });

    it('should update subscription when formActor is updated', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      component.subscribe = jest.fn();

      const div = document.createElement('div');
      div.id = 'object.sidebar.image';

      (component.formCards as any) = [ div ];

      const map = new Map<string, string>();
      map.set('actor', 'test');
      map.set('formActor', 'test');

      await component.updated(map);

      expect(component.subscribe).toHaveBeenCalledTimes(7);

    });

    it('should should call registerComponents() when formCards is undefined', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      component.registerComponents = jest.fn(async() => undefined);

      component.formCards = undefined;

      component.components = [
        {
          description: 'Digita SemCom component voor beeldmateriaal informatie.',
          label: 'Erfgoedobject Beeldmateriaal',
          uri: 'http://localhost:3004/object-imagery.component.js',
          shapes: [ 'http://xmlns.com/foaf/0.1/PersonalProfileDocument' ],
          author: 'https://digita.ai',
          tag: 'nde-object-imagery',
          version: '0.1.0',
          latest: true,
        },
      ];

      await component.updateComplete;
      await component.updated(undefined);

      expect(component.registerComponents).toHaveBeenCalled();

    });

  });

  describe('onImageSelected()', () => {

    const imageFile = new File([ 'foo' ], 'foo.jpg', { type: 'image/jpeg' });

    it('should set object.imageFile', async () => {

      component.formActor = {
        send: jest.fn(),
      } as any;

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.object.imageFile).toBeFalsy();

      component['onImageSelected'](new CustomEvent('image-selected', { detail: imageFile }));

      expect(component.object.imageFile).toBeTruthy();
      expect(component.object.imageFile).toEqual(imageFile);

    });

    it('should send FormUpdatedEvent to formactor', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      component.formActor.send = jest.fn();
      component['onImageSelected'](new CustomEvent('image-selected', { detail: imageFile }));
      expect(component.formActor.send).toHaveBeenCalledWith(new FormUpdatedEvent('image', expect.any(String)));

    });

  });

});
