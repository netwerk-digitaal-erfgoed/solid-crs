import { State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Term, TermService, TermSource } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { assign, createMachine, StateMachine } from 'xstate';
import { log } from 'xstate/lib/actions';
import { TermEvent, TermEvents } from './term.events';

/**
 * The context of the term machine.
 */
export interface TermContext {
  /**
   * The field for which terms are being edited.
   */
  term?: string;
  /**
   * User search input
   */
  query?: string;
  /**
   * All sources
   */
  sources?: TermSource[];
  /**
   * The sources selected by the user.
   */
  selectedSources?: TermSource[];
  /**
   * All search results
   */
  searchResults?: Term[];
  /**
   * The selected search results
   */
  selectedTerms?: Term[];
  /**
   * The term service for interacting with the term network
   */
  termService: TermService;
}

/**
 * Actor references for this machine config.
 */
export enum TermActors {
  TERM_MACHINE = 'TermMachine',
}

/**
 * State references for the term machine, with readable log format.
 */
export enum TermStates {
  IDLE      = '[TermState: Idle]',
  QUERYING  = '[TermState: Querying]',
  SUBMITTED = '[TermState: Submitted]',
}

/**
 * The term machine.
 */
export const termMachine = (): StateMachine<TermContext, any, TermEvent, State<TermStates, TermContext>> =>
  createMachine<TermContext, TermEvent, State<TermStates, TermContext>>({
    id: TermActors.TERM_MACHINE,
    context: {
      termService: new TermService(process.env.VITE_TERM_ENDPOINT),
      selectedTerms: [],
    },
    initial: TermStates.IDLE,
    states: {
      /**
       * The idle state of the Term machine
       */
      [TermStates.IDLE]: {
        on: {
          [TermEvents.QUERY_UPDATED]: {
            target: TermStates.QUERYING,
            actions: assign(
              (context, event) => ({ query: event.query, selectedSources: event.sources  }),
            ),
          },
          [TermEvents.CLICKED_TERM]: {
            actions: assign(
              (context, event) => ({ selectedTerms: !context.selectedTerms.find((term) => term.uri === event.term.uri)
                // add the term if it is not yet selected
                ? [ ...context.selectedTerms, event.term ]
                // otherwise, remove it from selected terms
                : context.selectedTerms.filter((term) => term.uri !== event.term.uri) }),
            ),
          },
          [TermEvents.CLICKED_SUBMIT]: TermStates.SUBMITTED,
        },
      },
      /**
       * The machine is querying the endpoint using the TermService
       */
      [TermStates.QUERYING]: {
        invoke: {
          src: (context) => context.termService.query(context.query, context.sources),
          onDone: {
            target: TermStates.IDLE,
            actions: assign(
              (context, event) => ({ searchResults: event.data }),
            ),
          },
        },
      },
      /**
       * The user has clicked submit and the machine terminates
       */
      [TermStates.SUBMITTED]: {
        type: 'final',
      },
    },
  });
