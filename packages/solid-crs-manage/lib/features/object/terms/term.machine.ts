import { FormActors, formMachine, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Term, TermService, TermSource } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { assign, createMachine, sendParent, StateMachine } from 'xstate';
import { AppEvents, ErrorEvent } from '../../../app.events';
import { ClickedTermEvent, TermEvent, TermEvents } from './term.events';

/**
 * The context of the term machine.
 */
export interface TermContext {
  /**
   * The field for which terms are being edited.
   */
  field?: string;
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
  selectedSources?: string[];
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
  CREATING = '[TermState: Creating]',
  LOADING_SOURCES = '[TermState: Loading Sources]',
}

/**
 * Action which adds/removes a Term from the context
 */
export const toggleTerm = assign<TermContext, ClickedTermEvent>(
  (context, event) => ({ selectedTerms: !context.selectedTerms?.find((term) => term.uri === event.term.uri)
  // add the term if it is not yet selected
    ? context.selectedTerms ? [ ...context.selectedTerms, event.term ] : [ event.term ]
  // otherwise, remove it from selected terms
    : context.selectedTerms?.filter((term) => term.uri !== event.term.uri) }),
);

/**
 * The term machine.
 */
export const termMachine = (): StateMachine<TermContext, any, TermEvent, State<TermStates, TermContext>> =>
  createMachine<TermContext, TermEvent, State<TermStates, TermContext>>({
    id: TermActors.TERM_MACHINE,
    initial: TermStates.LOADING_SOURCES,
    states: {
      [TermStates.LOADING_SOURCES]: {
        invoke: {
          src: (context) => context.termService.getSources(),
          onDone: {
            target: TermStates.IDLE,
            actions: [
              assign((context, event) => ({ sources: event.data })),
            ],
          },
          onError: {
            target: TermStates.IDLE,
            actions: sendParent({ type: AppEvents.ERROR, data: { error: 'term.error.term-network-error' } } as ErrorEvent),
          },
        },
      },
      /**
       * The idle state of the Term machine
       */
      [TermStates.IDLE]: {
        invoke: {
          id: FormActors.FORM_MACHINE,
          src: formMachine<{ query: string; sources: string[] }>(
          ),
          data: (context) => ({
            data: { query: context.query||'', sources: context.selectedSources||[] },
            original: { query: context.query||'', sources: context.selectedSources||[] },
          }),
        },
        on: {
          [TermEvents.QUERY_UPDATED]: {
            target: TermStates.QUERYING,
            actions: assign(
              (context, event) => ({ query: event.query, selectedSources: event.sources  }),
            ),
          },
          [TermEvents.CLICKED_TERM]: {
            actions: toggleTerm,
          },
          [TermEvents.CLICKED_SUBMIT]: TermStates.SUBMITTED,
          [TermEvents.CLICKED_ADD]: TermStates.CREATING,
        },
      },
      /**
       * The machine is querying the endpoint using the TermService
       */
      [TermStates.QUERYING]: {
        invoke: [
          {
            src: (context) => context.termService.query(context.query, context.selectedSources),
            onDone: {
              target: TermStates.IDLE,
              actions: assign(
                (context, event) => ({ searchResults: event.data }),
              ),
            },
            onError: TermStates.IDLE,
          },
        ],
      },
      /**
       * The user is adding their own local term
       */
      [TermStates.CREATING]: {
        on: {
          [TermEvents.CLICKED_TERM]: {
            target: TermStates.IDLE,
            actions: toggleTerm,
          },
        },
      },
      /**
       * The user has clicked submit and the machine terminates
       */
      [TermStates.SUBMITTED]: {
        type: 'final',
        data: (context) => ({
          field: context.field,
          selectedTerms: context.selectedTerms,
        }),
      },
    },
  });
