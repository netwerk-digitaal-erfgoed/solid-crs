import { FormActors, FormUpdatedEvent, FormValidatedEvent, LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Term } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
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
      const button = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelector('form button') as HTMLButtonElement;
      expect(button).toBeTruthy();
      button.click();

    }

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
      component.searchResults = [ term, term, term ];
      await component.updateComplete;
      const searchResultCards = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.querySelectorAll('.term-list:nth-of-type(1) nde-large-card');
      expect(searchResultCards).toBeTruthy();
      expect(searchResultCards.length).toEqual(component.searchResults.length);

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
      component.searchResults = [ term, term, term ];
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

      const editedTerm = { uri: term.uri, name: term.name };

      component.sources = [ termSource ];
      component.selectedTerms = [ editedTerm ];
      component.searchResults = [ editedTerm ];
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
      component.searchResults = [ editedTerm ];
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
      component.searchResults = [];
      await component.updateComplete;
      const componentContent = window.document.body.getElementsByTagName('nde-term-search')[0].shadowRoot.innerHTML;
      expect(componentContent).toContain('nde.features.term.no-search-results');

    }

  });

});
