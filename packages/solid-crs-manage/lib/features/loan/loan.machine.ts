import { assign, DoneInvokeEvent, MachineConfig } from 'xstate';
import { log } from 'xstate/lib/actions';
import { LoanRequest, Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanContext } from './loan.context';
import { ClickedLoanRequestDetailEvent, LoanEvent, LoanEvents } from './loan.events';
import * as services from './loan.services';
import { LoanStates, LoanStateSchema } from './loan.states';

export const loanMachine: MachineConfig<LoanContext, LoanStateSchema, LoanEvent> = {
  initial: LoanStates.LOADING_LOAN_REQUESTS,
  states: {
    [LoanStates.LOADING_LOAN_REQUESTS]: {
      invoke: {
        src: services.loadRequests,
        onDone: {
          actions: assign({ loanRequests: (c, event: DoneInvokeEvent<LoanRequest[]>) => event.data }),
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
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
    [LoanStates.LOAN_REQUEST_OVERVIEW]: {
      on: {
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
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW]: {
          target: LoanStates.LOADING_LOAN_REQUESTS,
        },
        [LoanEvents.CLICKED_ACCEPTED_LOAN_REQUEST]: {
          target: LoanStates.ACCEPTING_LOAN_REQUEST,
        },
        [LoanEvents.CLICKED_REJECTED_LOAN_REQUEST]: {
          target: LoanStates.REJECTING_LOAN_REQUEST,
        },
      },
    },
    [LoanStates.LOAN_REQUEST_CREATION]: {
      on: {
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW]: {
          target: LoanStates.LOADING_LOAN_REQUESTS,
        },
        [LoanEvents.CLICKED_SEND_LOAN_REQUEST]: {
          target: LoanStates.SENDING_LOAN_REQUEST,
        },
      },
    },
    [LoanStates.SENDING_LOAN_REQUEST]: {
      invoke: {
        src: services.createRequest,
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        onError: {
          actions: log((c, e) => `Error Creating Request: ${e.data}`),
        },
      },
    },
    [LoanStates.ACCEPTING_LOAN_REQUEST]: {
      invoke: {
        src: services.acceptRequest,
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        onError: {
          actions: log((c, e) => `Error Accepting Request: ${e.data}`),
        },
      },
    },
    [LoanStates.REJECTING_LOAN_REQUEST]: {
      invoke: {
        src: services.rejectRequest,
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        onError: {
          actions: log((c, e) => `Error Rejecting Request: ${e.data}`),
        },
      },
    },
  },
};
