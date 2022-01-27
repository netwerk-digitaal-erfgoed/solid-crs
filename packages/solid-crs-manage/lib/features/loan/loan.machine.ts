import { assign, DoneInvokeEvent, MachineConfig } from 'xstate';
import { log } from 'xstate/lib/actions';
import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanContext } from './loan.context';
import { ClickedAcceptedLoanRequestEvent, ClickedRejectedLoanRequestEvent, ClickedSendLoanRequestEvent, LoanEvent, LoanEvents } from './loan.events';
import * as services from './loan.services';
import { LoanStates, LoanStateSchema } from './loan.states';

export const loanMachine: MachineConfig<LoanContext, LoanStateSchema, LoanEvent> = {
  initial: LoanStates.LOADING_LOAN_REQUESTS,
  states: {
    [LoanStates.LOADING_LOAN_REQUESTS]: {
      invoke: {
        src: () => services.loadRequests(),
        onDone: {
          actions: assign({ loanRequests: (context, event: DoneInvokeEvent<LoanRequest[]>) => event.data }),
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Loading Requests'),
        },
      },
    },
    [LoanStates.LOAN_REQUEST_OVERVIEW]: {
      on: {
        [LoanEvents.CLICKED_NEW_LOAN_REQUEST]: {
          target: LoanStates.LOAN_REQUEST_CREATION,
        },
        [LoanEvents.CLICKED_LOAN_REQUEST_DETAIL]: {
          actions: assign({ loanRequest: (context, event) => event.loanRequest }),
          target: LoanStates.LOAN_REQUEST_DETAIL,
        },
      },
    },
    [LoanStates.LOAN_REQUEST_DETAIL]: {
      on: {
        [LoanEvents.CLICKED_NEW_LOAN_REQUEST]: {
          target: LoanStates.LOAN_REQUEST_CREATION,
        },
        [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW]: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
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
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        [LoanEvents.CLICKED_SEND_LOAN_REQUEST]: {
          target: LoanStates.SENDING_LOAN_REQUEST,
        },
      },
    },
    [LoanStates.SENDING_LOAN_REQUEST]: {
      invoke: {
        src: (context, event: ClickedSendLoanRequestEvent) => services.createRequest(event.loanRequest),
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Creating Request'),
        },
      },
    },
    [LoanStates.ACCEPTING_LOAN_REQUEST]: {
      invoke: {
        src: (context, event: ClickedAcceptedLoanRequestEvent) => services.acceptRequest(event.loanRequest),
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Accepting Request'),
        },
      },
    },
    [LoanStates.REJECTING_LOAN_REQUEST]: {
      invoke: {
        src: (context, event: ClickedRejectedLoanRequestEvent) => services.rejectRequest(event.loanRequest),
        onDone: {
          target: LoanStates.LOAN_REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Rejecting Request'),
        },
      },
    },
  },
};
