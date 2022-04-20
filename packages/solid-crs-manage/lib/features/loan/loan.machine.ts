import { assign, DoneInvokeEvent, MachineConfig } from 'xstate';
import { log, send } from 'xstate/lib/actions';
import { LoanRequest, Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanContext } from './loan.context';
import { ClickedLoanRequestDetailEvent, CollectionImported, LoanEvent, LoanEvents } from './loan.events';
import * as services from './loan.services';
import { LoanStates, LoanStateSchema } from './loan.states';

export const loanMachine: MachineConfig<LoanContext, LoanStateSchema, LoanEvent> = {
  initial: LoanStates.LOADING_LOAN_REQUESTS,
  states: {
    [LoanStates.LOADING_LOAN_REQUESTS]: {
      invoke: {
        src: (c, e) => services.loadRequests(c, e),
        onDone: {
          actions: assign({ loanRequests: (c, event: DoneInvokeEvent<LoanRequest[]>) => event.data }),
          target: LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING,
        },
        onError: {
          actions: log((c, e) => `Error Loading Request: ${e.data}`),
        },
      },
    },
    [LoanStates.LOADING_COLLECTION]: {
      invoke: {
        src: (context, event: ClickedLoanRequestDetailEvent) =>
          context.collectionStore.get(event.loanRequest.collection),
        onDone: {
          actions: assign({ collection: (c, event: DoneInvokeEvent<Collection>) => event.data }),
          target: LoanStates.LOAN_REQUEST_DETAIL,
        },
        onError: {
          actions: log((c, e) => `Error Loading Collection: ${e.data}`),
        },
      },
    },
    [LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING]: {
      on: {
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_ACCEPTED]: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED,
        },
        [LoanEvents.CLICKED_NEW_LOAN_REQUEST]: {
          target: LoanStates.LOAN_REQUEST_CREATION,
        },
        [LoanEvents.CLICKED_LOAN_REQUEST_DETAIL]: {
          actions: assign({ loanRequest: (c, event) => event.loanRequest }),
          target: LoanStates.LOADING_COLLECTION,
        },
      },
    },
    [LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED]: {
      on: {
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_INCOMING]: {
          target: LoanStates.LOADING_LOAN_REQUESTS,
        },
        [LoanEvents.CLICKED_NEW_LOAN_REQUEST]: {
          target: LoanStates.LOAN_REQUEST_CREATION,
        },
        [LoanEvents.CLICKED_LOAN_REQUEST_DETAIL]: {
          actions: assign({ loanRequest: (c, event) => event.loanRequest }),
          target: LoanStates.LOADING_COLLECTION,
        },
      },
    },
    [LoanStates.LOAN_REQUEST_DETAIL]: {
      on: {
        [LoanEvents.CLICKED_NEW_LOAN_REQUEST]: {
          target: LoanStates.LOAN_REQUEST_CREATION,
        },
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_INCOMING]: {
          target: LoanStates.LOADING_LOAN_REQUESTS,
        },
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_ACCEPTED]: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED,
        },
        [LoanEvents.CLICKED_ACCEPTED_LOAN_REQUEST]: {
          target: LoanStates.ACCEPTING_LOAN_REQUEST,
        },
        [LoanEvents.CLICKED_REJECTED_LOAN_REQUEST]: {
          target: LoanStates.REJECTING_LOAN_REQUEST,
        },
        [LoanEvents.CLICKED_IMPORT_COLLETION]: {
          target: LoanStates.IMPORTING_COLLECTION,
        },
      },
    },
    [LoanStates.LOAN_REQUEST_CREATION]: {
      on: {
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_INCOMING]: {
          target: LoanStates.LOADING_LOAN_REQUESTS,
        },
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_ACCEPTED]: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED,
        },
        [LoanEvents.CLICKED_SEND_LOAN_REQUEST]: {
          target: LoanStates.SENDING_LOAN_REQUEST,
        },
      },
    },
    [LoanStates.SENDING_LOAN_REQUEST]: {
      invoke: {
        src: (c, e) => services.createRequest(c, e),
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING,
        },
        onError: {
          actions: log((c, e) => `Error Creating Request: ${e.data}`),
        },
      },
    },
    [LoanStates.ACCEPTING_LOAN_REQUEST]: {
      invoke: {
        src: (c, e) => services.acceptRequest(c, e),
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING,
        },
        onError: {
          actions: log((c, e) => `Error Accepting Request: ${e.data}`),
        },
      },
    },
    [LoanStates.REJECTING_LOAN_REQUEST]: {
      invoke: {
        src: (c, e) => services.rejectRequest(c, e),
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING,
        },
        onError: {
          actions: log((c, e) => `Error Rejecting Request: ${e.data}`),
        },
      },
    },
    [LoanStates.IMPORTING_COLLECTION]: {
      invoke: {
        src: (c, e) => services.importCollection(c, e),
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED,
          actions: send((c, event) => new CollectionImported(event.data)),
        },
        onError: {
          actions: log((c, e) => `Error Importing Collection: ${e.data}`),
        },
      },
    },
  },
};
