import { assign, DoneInvokeEvent, MachineConfig } from 'xstate';
import { log } from 'xstate/lib/actions';
import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanContext } from './loan.context';
import { ClickedAcceptedLoanRequestEvent, ClickedRejectedLoanRequestEvent, ClickedSendLoanRequestEvent, LoanEvent, LoanEvents } from './loan.events';
import * as services from './loan.services';
import { LoanStates, LoanStateSchema } from './loan.states';

export const loanMachine: MachineConfig<LoanContext, LoanStateSchema, LoanEvent> = {
  initial: LoanStates.LOADING_REQUESTS,
  states: {
    [LoanStates.LOADING_REQUESTS]: {
      invoke: {
        src: () => services.loadRequests(),
        onDone: {
          actions: assign({ loanRequests: (context, event: DoneInvokeEvent<LoanRequest[]>) => event.data }),
          target: LoanStates.REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Loading Requests'),
        },
      },
    },
    [LoanStates.REQUEST_OVERVIEW]: {
      on: {
        [LoanEvents.CLICKED_NEW_LOANREQUEST]: {
          target: LoanStates.CREATING_REQUEST,
        },
        [LoanEvents.CLICKED_LOANREQUEST_DETAIL]: {
          actions: assign({ loanRequest: (context, event) => event.loanRequest }),
          target: LoanStates.REQUEST_DETAIL,
        },
      },
    },
    [LoanStates.REQUEST_DETAIL]: {
      on: {
        [LoanEvents.CLICKED_NEW_LOANREQUEST]: {
          target: LoanStates.CREATING_REQUEST,
        },
        [LoanEvents.CLICKED_LOANREQUEST_OVERVIEW]: {
          target: LoanStates.REQUEST_OVERVIEW,
        },
        [LoanEvents.CLICKED_ACCEPTED_LOANREQUEST]: {
          target: LoanStates.ACCEPTING_REQUEST,
        },
        [LoanEvents.CLICKED_REJECTED_LOANREQUEST]: {
          target: LoanStates.REJECTING_REQUEST,
        },
      },
    },
    [LoanStates.CREATING_REQUEST]: {
      on: {
        [LoanEvents.CLICKED_LOANREQUEST_OVERVIEW]: {
          target: LoanStates.REQUEST_OVERVIEW,
        },
        [LoanEvents.CLICKED_SEND_LOANREQUEST]: {
          target: LoanStates.SENDING_REQUEST,
        },
      },
    },
    [LoanStates.SENDING_REQUEST]: {
      invoke: {
        src: (context, event: ClickedSendLoanRequestEvent) => services.createRequest(event.loanRequest),
        onDone: {
          target: LoanStates.REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Creating Request'),
        },
      },
    },
    [LoanStates.ACCEPTING_REQUEST]: {
      invoke: {
        src: (context, event: ClickedAcceptedLoanRequestEvent) => services.acceptRequest(event.loanRequest),
        onDone: {
          target: LoanStates.REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Accepting Request'),
        },
      },
    },
    [LoanStates.REJECTING_REQUEST]: {
      invoke: {
        src: (context, event: ClickedRejectedLoanRequestEvent) => services.rejectRequest(event.loanRequest),
        onDone: {
          target: LoanStates.REQUEST_OVERVIEW,
        },
        onError: {
          actions: log('Error Rejecting Request'),
        },
      },
    },
  },
};
