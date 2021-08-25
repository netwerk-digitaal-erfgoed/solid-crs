import { Alert, FormActors, FormUpdatedEvent, FormValidatedEvent, LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Term } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from '../../../app.events';
import { ClickedCancelTermEvent, ObjectEvents } from '../object.events';
import { TermSearchComponent } from './term-search.component';
import { ClickedSubmitEvent, ClickedTermEvent, QueryUpdatedEvent } from './term.events';
import { TermContext, termMachine, TermStates } from './term.machine';

describe('TermSearchComponent', () => {

  let component: TermSearchComponent;
  let machine: Interpreter<TermContext>;
  let formMachine: Interpreter<TermContext>;
  let termService;

  const term: Term = {
    uri: 'uri',
    name: 'name',
    description: 'test',
    alternateName: [ 'test' ],
    broader: [ { name: 'test', uri: '' } ],
    narrower: [ { name: 'test', uri: '' } ],
    hiddenName: [ 'test' ],
    source: 'source1',
  };

  const termSource = { uri: 'uri', name: 'name', creators: [] };

  beforeEach(() => {

    process.env.VITE_TERM_ENDPOINT = 'http://localhost/';

    termService = {
      endpoint: 'https://endpoint.url/',
      query: jest.fn(async() => term),
      getSources: jest.fn(async() => [ termSource ]),
    };

    machine = interpret(termMachine()
      .withContext({
        termService: termService as any,
        selectedTerms: [],
      }));

    component = window.document.createElement('nde-term-search') as TermSearchComponent;

    component.actor = machine;

    component.translator = {
      translate: jest.fn((key) => key),
    };

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', async () => {

    expect(component).toBeTruthy();

  });

  it('should update subscriptions when actor is updated', async () => {

    machine.start();

    window.document.body.appendChild(component);
    await component.updateComplete;

    component.subscribe = jest.fn();

    const map = new Map<string, string>();
    map.set('actor', 'test');

    component.updated(map);

    expect(component.subscribe).toHaveBeenCalledTimes(5);

  });

  it('should send QueryUpdatedEvent when formActor receives FormValidatedEvent', async (done) => {

    machine.onEvent((event) => {

      if (event instanceof QueryUpdatedEvent) {

        done();

      }

    });

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      await component.updateComplete;
      component.sourceCheckboxes.forEach((checkbox) => (checkbox as HTMLInputElement).checked = true);
      formMachine = machine.children.get(FormActors.FORM_MACHINE);
      component.formActor = formMachine;
      formMachine.send(new FormUpdatedEvent('', ''));
      formMachine.send(new FormValidatedEvent([]));

    }

  });

  it('should send ClickedSubmitEvent when "Bevestigen" button is clicked', async (done) => {

    machine.onEvent((event) => {

      if (event instanceof ClickedSubmitEvent) {

        done();

      }

    });

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      await component.updateComplete;
      const button = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelector('.confirm') as HTMLButtonElement;
      expect(button).toBeTruthy();
      button.click();

    }

  });

  it('should send ClickedCancelTermEvent when "Annuleren" button is clicked', async (done) => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    machine.parent = {
      send: jest.fn(),
    } as any;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      await component.updateComplete;
      const button = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelector('.cancel') as HTMLButtonElement;
      expect(button).toBeTruthy();
      button.click();

    }

    expect(machine.parent.send).toHaveBeenCalledWith(new ClickedCancelTermEvent());
    done();

  });

  it('should show large card for every selected term', async () => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      component.selectedTerms = [ term, term, term ];
      await component.updateComplete;
      const selectedTermCards = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelectorAll('.term-list:first-of-type nde-large-card');
      expect(selectedTermCards).toBeTruthy();
      expect(selectedTermCards.length).toEqual(component.selectedTerms.length);

    }

  });

  it('should send ClickedTermEvent when a selected term is clicked', async (done) => {

    machine.onEvent((event) => {

      if (event instanceof ClickedTermEvent) {

        done();

      }

    });

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      component.selectedTerms = [ term, term, term ];
      await component.updateComplete;
      const selectedTermCards: NodeListOf<HTMLElement> = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelectorAll('.term-list:first-of-type nde-large-card');
      expect(selectedTermCards).toBeTruthy();
      selectedTermCards[0].click();

    }

  });

  it('should show large card for every search result', async () => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      component.searchResultsMap = { [term.source]: [ term, term, term ] };
      await component.updateComplete;
      const searchResultCards = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelectorAll('.term-list:nth-of-type(1) nde-large-card');
      expect(searchResultCards).toBeTruthy();
      expect(searchResultCards.length).toEqual(component.searchResultsMap[term.source].length);

    }

  });

  it('should send ClickedTermEvent when a search result is clicked', async (done) => {

    machine.onEvent((event) => {

      if (event instanceof ClickedTermEvent) {

        done();

      }

    });

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      component.searchResultsMap = { [term.source]: [ term, term, term ] };
      await component.updateComplete;
      const searchResultCards: NodeListOf<HTMLElement> = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelectorAll('.term-list:nth-of-type(1) nde-large-card');
      expect(searchResultCards).toBeTruthy();
      searchResultCards[0].click();

    }

  });

  it('should hide content from card when only uri and name are set on term', async() => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      const editedTerm = { uri: term.uri, name: term.name, source: 'sourceUri' };

      component.sources = [ termSource ];
      component.selectedTerms = [ editedTerm ];
      component.searchResultsMap = { [editedTerm.source]: [ editedTerm ] };
      await component.updateComplete;
      const selectedTermCard = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelector('.term-list:first-of-type nde-large-card') as LargeCardComponent;
      const searchResultCard = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelector('.term-list:nth-of-type(1) nde-large-card') as LargeCardComponent;
      expect(searchResultCard).toBeTruthy();
      expect(selectedTermCard).toBeTruthy();
      expect(searchResultCard.showContent).toBeFalsy();
      expect(selectedTermCard.showContent).toBeFalsy();

    }

  });

  it.each(
    [ 'description', 'alternateName', 'broader', 'narrower', 'hiddenName' ]
  )('should hide %s from card when it is not set on term', async (value) => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      const editedTerm = { ...term, [value]: undefined  };

      component.sources = [ termSource ];
      component.selectedTerms = [ editedTerm ];
      component.searchResultsMap = { [editedTerm.source]: [ editedTerm ] };
      await component.updateComplete;
      const selectedTermCard = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelector('.term-list:first-of-type nde-large-card');
      const searchResultCard = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelector('.term-list:nth-of-type(1) nde-large-card');
      expect(searchResultCard).toBeTruthy();
      expect(selectedTermCard).toBeTruthy();
      expect(searchResultCard.innerHTML).not.toContain(`nde.features.term.field.${value}`);
      expect(selectedTermCard.innerHTML).not.toContain(`nde.features.term.field.${value}`);

    }

  });

  it('should display \'geen zoekresultaten\' when no search results are set', async() => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    if (machine.state.matches(TermStates.IDLE)) {

      component.sources = [ termSource ];
      component.selectedTerms = [];
      component.searchResultsMap = {};
      await component.updateComplete;
      const componentContent = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.innerHTML;
      expect(componentContent).toContain('nde.features.term.no-search-results');

    }

  });

  describe('groupSearchResults()', () => {

    it('should group search results', () => {

      const source1Terms = [ term, term, term ];

      const altTerm: Term =  { ...term, source: 'source2' };

      const source2Terms = [
        altTerm,
        altTerm,
      ];

      const result = component.groupSearchResults([ ...source1Terms, ...source2Terms ]);

      expect(result[term.source].length).toEqual(source1Terms.length);
      expect(result[altTerm.source].length).toEqual(source2Terms.length);

    });

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

    it('should send dismiss alert event to object machine\'s parent', async () => {

      machine.start();
      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.parent = {
        parent: {
          send: jest.fn(),
        } as any,
      } as any;

      component.handleDismiss({ detail: alert } as CustomEvent<Alert>);

      expect(machine.parent.parent.send).toHaveBeenCalledWith(AppEvents.DISMISS_ALERT, { alert });

    });

  });

});
