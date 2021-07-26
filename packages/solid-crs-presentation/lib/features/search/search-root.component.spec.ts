import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents, DismissAlertEvent } from '../../app.events';
import { appMachine } from '../../app.machine';
import { SearchRootComponent } from './search-root.component';
import { SearchEvents, SearchUpdatedEvent } from './search.events';
import { SearchContext, searchMachine } from './search.machine';

describe('SearchRootComponent', () => {

  let component: SearchRootComponent;
  let machine: Interpreter<SearchContext>;

  const collection1: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: '',
    distribution: '',
  };

  const collection2: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: '',
    distribution: '',
  };

  const object1: CollectionObject = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    type: null,
    updated: '0',
    collection: 'collection-uri-1',
  };

  beforeEach(() => {

    const collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);
    const objectStore = new CollectionObjectMemoryStore([ object1 ]);
    const searchTerm = 'collection 2';

    machine = interpret(searchMachine(collectionStore, objectStore).withContext({ searchTerm }));

    machine.parent = interpret(appMachine(
      collectionStore,
      objectStore,
    ).withContext({
      alerts: [],
      selected: collection1,
    }));

    component = window.document.createElement('nde-search-root') as SearchRootComponent;
    component.actor = machine;
    component.translator = new MemoryTranslator([], 'nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show alerts when set', async () => {

    component.alerts = [ {
      type: 'success',
      message: 'Foo',
    } ];

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(1);

  });

  it('should not show alerts when unset', async () => {

    component.alerts = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);

  });

  it('should display the right nde-cards', async () => {

    window.document.body.appendChild(component);
    component.collections = [ collection2 ];
    component.objects = [ object1 ];
    await component.updateComplete;

    const shownCollectionCards = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-collection-card');
    const shownObjectCards = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-object-card');

    expect(shownCollectionCards).toBeTruthy();
    expect(shownObjectCards).toBeTruthy();
    expect(shownCollectionCards.length).toBe(1);
    expect(shownObjectCards.length).toBe(1);

    const shownCollectionName = shownCollectionCards[0].shadowRoot.querySelector('nde-card > span[slot="title"]');
    const shownObjectName = shownObjectCards[0].shadowRoot.querySelector('nde-card > span[slot="title"]');
    expect(shownCollectionName.textContent.trim()).toBe(collection2.name);
    expect(shownObjectName.textContent.trim()).toBe(object1.name);

  });

  it('should only display collections when no objects match the searchTerm', async () => {

    window.document.body.appendChild(component);
    component.collections = [ collection2, collection1 ];
    component.objects = [];
    await component.updateComplete;

    const shownCollectionCards = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-collection-card');
    const shownObjectCards = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-object-card');

    expect(shownCollectionCards).toBeTruthy();
    expect(shownObjectCards).toBeTruthy();
    expect(shownCollectionCards.length).toBe(2);
    expect(shownObjectCards.length).toBe(0);

  });

  it('should only display objects when no collections match the searchTerm', async () => {

    window.document.body.appendChild(component);
    component.collections = [];
    component.objects = [ object1 ];
    await component.updateComplete;

    const shownCollectionCards = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-collection-card');
    const shownObjectCards = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelectorAll('nde-object-card');

    expect(shownCollectionCards).toBeTruthy();
    expect(shownObjectCards).toBeTruthy();
    expect(shownCollectionCards.length).toBe(0);
    expect(shownObjectCards.length).toBe(1);

  });

  it('should show the searchTerm in the content-header', async () => {

    window.document.body.appendChild(component);
    const searchTerm = 'testingTerm';
    component.searchTerm = searchTerm;
    await component.updateComplete;

    const title = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelector('nde-content-header div[slot="title"]');

    expect(title.textContent).toMatch(searchTerm);

  });

  it('should show the empty page when nothing matches the searchTerm', async () => {

    window.document.body.appendChild(component);
    component.searchTerm = 't';
    component.collections = [];
    component.objects = [];
    await component.updateComplete;

    const emptyContainer = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelector('.empty-container');
    expect(emptyContainer).toBeTruthy();

    const textDiv = emptyContainer.querySelector('.text');
    expect(textDiv).toBeTruthy();
    expect(textDiv.textContent).toBe('nde.features.search.root.empty.no-search-results');

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

  it('should send empty search updated event when header dismiss icon is clicked', async (done) => {

    machine.onEvent((event) => {

      if(event && event.type === SearchEvents.SEARCH_UPDATED) {

        const casted = event as SearchUpdatedEvent;

        expect(casted.searchTerm).toEqual('');
        done();

      }

    });

    machine.start();
    machine.parent.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const button = window.document.body.getElementsByTagName('nde-search-root')[0].shadowRoot.querySelector<HTMLDivElement>('div[slot="actions"]');

    expect(button).toBeTruthy();
    button.click();

  });

  describe('updated', () => {

    it('should not subscribe to alerts when actor.parent in undefined', async (done) => {

      window.document.body.appendChild(component);
      component.actor.parent = undefined;
      await component.updateComplete;
      done();

    });

  });

});
