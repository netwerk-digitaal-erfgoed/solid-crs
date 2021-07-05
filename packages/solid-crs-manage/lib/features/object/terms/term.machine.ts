import { FormEvents, FormActors, formMachine, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';

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
  LOADING_SOURCES = '[TermState: Loading Sources]',
}

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
          // onDone: {
          //   target: TermStates.QUERYING,
          //   actions: [
          //     assign((context, event) => ({
          //       query: event.data.data.query,
          //       selectedSources: event.data.data.sources,
          //     })),
          //   ],
          // },
        },
        on: {
          [TermEvents.QUERY_UPDATED]: {
            target: TermStates.QUERYING,
            actions: assign(
              (context, event) => ({ query: event.query, selectedSources: event.sources  }),
            ),
          },
          [TermEvents.CLICKED_TERM]: {
            actions: assign(
              (context, event) => ({ selectedTerms: !context.selectedTerms?.find((term) => term.uri === event.term.uri)
                // add the term if it is not yet selected
                ? context.selectedTerms ? [ ...context.selectedTerms, event.term ] : [ event.term ]
                // otherwise, remove it from selected terms
                : context.selectedTerms?.filter((term) => term.uri !== event.term.uri) }),
            ),
          },
          [TermEvents.CLICKED_SUBMIT]: TermStates.SUBMITTED,
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
