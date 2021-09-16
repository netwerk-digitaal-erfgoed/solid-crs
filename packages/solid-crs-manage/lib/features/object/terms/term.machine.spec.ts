import { interpret, Interpreter } from 'xstate';
import { ClickedAddEvent, ClickedSubmitEvent, ClickedTermEvent, QueryUpdatedEvent } from './term.events';
import { TermContext, termMachine, TermStates } from './term.machine';

describe('TermMachine', () => {

  let machine: Interpreter<TermContext>;
  let termService;

  const term = { uri: 'uri', name: 'name' };
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

    machine.onTransition((state) => {

      if(state.matches(TermStates.IDLE)) {

        machine.send(new QueryUpdatedEvent('test', []));

      }

    });

    machine.start();

  });

  it('should transition to SUBMITTED when CLICKED_SUBMIT was fired', async (done) => {

    machine.onStop(() => {

      done();

    });

    machine.onTransition((state) => {

      if(state.matches(TermStates.IDLE)) {

        machine.send(new ClickedSubmitEvent());

      }

    });

    machine.start();

  });

  it('should add term when CLICKED_TERM was fired for the first time', async (done) => {

    machine = interpret(termMachine()
      .withContext({
        termService: termService as any,
        selectedTerms: undefined,
      }));

    machine.onTransition((state) => {

      if(state.matches(TermStates.IDLE)) {

        if (state.context.selectedTerms?.includes(term)) {

          done();

        } else {

          machine.send(new ClickedTermEvent(term));

        }

      }

    });

    machine.start();

  });

  it('should remove term when CLICKED_TERM was fired for the second time', async (done) => {

    let clickedOnce = false;

    machine.onTransition((state) => {

      if(!clickedOnce && state.context.selectedTerms?.includes(term)) {

        machine.send(new ClickedTermEvent(term));
        clickedOnce = true;

      } else if (clickedOnce && !state.context.selectedTerms?.includes(term)) {

        done();

      } else if (state.matches(TermStates.IDLE)) {

        machine.send(new ClickedTermEvent(term));

      }

    });

    machine.start();

  });

  it('should transition back to IDLE when ClickedTermEvent is fired when CREATING', async (done) => {

    let clickedOnce = false;

    machine.onTransition((state) => {

      if (clickedOnce && state.matches(TermStates.IDLE)) {

        done();

      } else if (state.matches(TermStates.IDLE)) {

        machine.send(new ClickedAddEvent());
        clickedOnce = true;

      } else if (state.matches(TermStates.CREATING)) {

        machine.send(new ClickedTermEvent(term));

      }

    });

    machine.start();

  });

});
