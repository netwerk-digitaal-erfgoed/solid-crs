import { Alert, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, CollectionObjectMemoryStore, MemoryTranslator, Collection, CollectionObject, CollectionMemoryStore, ConsoleLogger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectImageryComponent } from '@netwerk-digitaal-erfgoed/solid-crs-semcom-components';
import { interpret, Interpreter } from 'xstate';
import { AppEvents, DismissAlertEvent } from '../../app.events';
import { appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { CollectionEvents } from '../collection/collection.events';
import { ObjectRootComponent } from './object-root.component';
import { ObjectContext, objectMachine } from './object.machine';

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
    image: 'test-uri',
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    updated: '0',
    collection: 'collection-uri-1',
    type: 'http://schema.org/Photograph',
    additionalType: [ { 'name':'bidprentjes', 'uri':'https://data.cultureelerfgoed.nl/term/id/cht/1e0adea5-71fa-4197-ad73-90b706d2357c' } ],
    identifier: 'SK-A-1115',
    maintainer: 'https://data.hetlageland.org/',
    creator: [ { 'name':'Jan Willem Pieneman', 'uri':'http://www.wikidata.org/entity/Q512948' } ],
    locationCreated: [ { 'name':'Delft', 'uri':'http://www.wikidata.org/entity/Q33432813' } ],
    material: [ { 'name':'olieverf', 'uri':'http://vocab.getty.edu/aat/300015050' } ],
    dateCreated: '1824-07-24',
    subject: [ { 'name':'veldslagen', 'uri':'http://vocab.getty.edu/aat/300185692' } ],
    location: [ { 'name':'Waterloo', 'uri':'http://www.wikidata.org/entity/Q31579578' } ],
    person: [ { 'name':'Arthur Wellesley of Wellington', 'uri':'http://data.bibliotheken.nl/id/thes/p067531180' } ],
    event: [ { 'name':'Slag bij Waterloo', 'uri':'http://www.wikidata.org/entity/Q48314' } ],
    organization: [ { 'name':'Slag bij Waterloo', 'uri':'http://www.wikidata.org/entity/Q48314' } ],
    height: 52,
    width: 82,
    depth: 2,
    weight: 120,
    heightUnit: 'CMT',
    widthUnit: 'CMT',
    depthUnit: 'CMT',
    weightUnit: 'KGM',
    mainEntityOfPage: 'http://localhost:3000/hetlageland/heritage-objects/data-1#object-1-digital',
    license: 'https://creativecommons.org/publicdomain/zero/1.0/deed.nl',
  };

  beforeEach(() => {

    if (!customElements.get('nde-object-imagery')) customElements.define('nde-object-imagery', ObjectImageryComponent);

    jest.restoreAllMocks();

    const collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    const objectStore = new CollectionObjectMemoryStore([
      object1,
    ]);

    machine = interpret(objectMachine()
      .withContext({
        object: object1,
        collections: [ collection1, collection2 ],
      }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.error, LoggerLevel.error)),
      collectionStore,
      objectStore,
    ).withContext({
      collections: [ collection1, collection2 ],
      alerts: [],
    }));

    component = window.document.createElement('nde-object-root') as ObjectRootComponent;

    component.actor = machine;

    component.translator = new MemoryTranslator([], 'nl-NL');

    component.object = object1;

    component.collections = [ collection1, collection2 ];

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

          expect((event as DismissAlertEvent).alert).toEqual(alert);
          done();

        }

      });

      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);

    });

  });

  describe('updated()', () => {

    it('should update subscription when formActor is updated', async () => {

      machine.start();

      window.document.body.appendChild(component);
      await component.updateComplete;

      component.subscribe = jest.fn();

      const map = new Map<string, string>();
      map.set('actor', 'test');
      map.set('formActor', 'test');

      await component.updated(map);

      expect(component.subscribe).toHaveBeenCalledTimes(4);

    });

  });

  it('should show content when object is set', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const formContent = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content');
    expect(formContent).toBeTruthy();

  });

  it('should hide content when object is undefined', async () => {

    window.document.body.appendChild(component);

    component.object = undefined;
    await component.updateComplete;

    const formContent = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector('div.content');
    expect(formContent).toBeFalsy();

  });

  it('should call toggleImage and show popup when image is clicked', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.imagePopup.hidden = false;

    const image = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector<HTMLElement>('div.content img:first-of-type');
    image.click();
    expect(component.imagePopup.hidden).toEqual(true);

  });

  it('should call toggleImage and hide popup when cross icon is clicked', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.imagePopup.hidden = true;

    const image = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector<HTMLElement>('#dismiss-popup');
    image.click();
    expect(component.imagePopup.hidden).toEqual(false);

  });

  it('should call toggleInfo and show menu when dots icon is clicked', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.infoPopup.hidden = true;

    const infoIcon = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector<HTMLElement>('nde-content-header div[slot="actions"] div');
    infoIcon.click();
    expect(component.infoPopup.hidden).toEqual(false);

  });

  it('should copy url to clipboard when info menu item is clicked', async () => {

    navigator.clipboard = {
      writeText: jest.fn(async() => undefined),
    };

    machine.parent.onEvent((event) => {

      if (event.type === AppEvents.ADD_ALERT) {

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

      }

    });

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.infoPopup.hidden = false;

    const copyAnchor = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector<HTMLElement>('nde-content-header div[slot="actions"] div a:last-of-type');
    copyAnchor.click();

  });

  it('should send SelectedCollectionEvent to parent when collection is clicked', async (done) => {

    machine.parent.onEvent((event) => {

      if (event.type === CollectionEvents.SELECTED_COLLECTION) {

        done();

      }

    });

    machine.start();
    machine.parent.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const collectionAnchor = window.document.body.getElementsByTagName('nde-object-root')[0].shadowRoot.querySelector<HTMLAnchorElement>('#identification-card div a');
    collectionAnchor.click();

  });

});
