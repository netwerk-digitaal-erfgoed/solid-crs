import { writeFileSync } from 'fs';
import { interpret, Interpreter } from 'xstate';
import { ClickedSubmitEvent, ClickedTermEvent, QueryUpdatedEvent, TermEvent } from './term.events';
import { TermContext, termMachine, TermStates } from './term.machine';

describe('TermMachine', () => {

  let machine: Interpreter<TermContext>;

  const term = { uri: 'uri', name: 'name' };
  const termSource = { uri: 'uri', name: 'name', creators: [] };

  beforeEach(() => {

    process.env.VITE_TERM_ENDPOINT = 'http://localhost/';

    const termService = {
      endpoint: 'https://endpoint.url/',
      query: jest.fn(async() => term),
      getSources: jest.fn(async() => [ termSource ]),
    };

    machine = interpret(termMachine()
      .withContext({
        termService: termService as any,
        selectedTerms: [],
      }));

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should transition to QUERYING when QUERY_UPDATED was fired', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(TermStates.QUERYING)) {

        done();

      }

    });

    machine.start();
    machine.send(new QueryUpdatedEvent('test', []));

  });

  it('should transition to SUBMITTED when CLICKED_SUBMIT was fired', async (done) => {

    machine.onStop(() => {

      done();

    });

    machine.start();
    machine.send(new ClickedSubmitEvent());

  });

  it('should add query and sources when CLICKED_TERM was fired for the first time', async (done) => {

    machine.onTransition((state) => {

      if(state.context.selectedTerms.includes(term)) {

        done();

      }

    });

    machine.start();
    machine.send(new ClickedTermEvent(term));

  });

  it('should add query and sources when CLICKED_TERM was fired for the first time', async (done) => {

    let clickedOnce = false;

    machine.onTransition((state) => {

      if(!clickedOnce && state.context.selectedTerms.includes(term)) {

        machine.send(new ClickedTermEvent(term));
        clickedOnce = true;

      }

      if(clickedOnce && !state.context.selectedTerms.includes(term)) {

        done();

      }

    });

    machine.start();
    machine.send(new ClickedTermEvent(term));

  });

});
