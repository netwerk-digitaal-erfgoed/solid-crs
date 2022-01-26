/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { createMachine, interpret, Interpreter } from 'xstate';
import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanContext } from './loan.context';
import {
  ClickedNewLoanRequestEvent,
  ClickedAcceptedLoanRequestEvent,
  ClickedLoanRequestDetailEvent,
  ClickedLoanRequestOverviewEvent,
  ClickedRejectedLoanRequestEvent,
  ClickedSendLoanRequestEvent,
  LoanEvent,
  LoanEvents,
} from './loan.events';
import { LoanState, LoanStates } from './loan.states';
import { loanMachine } from './loan.machine';
import * as services from './loan.services';

describe('loanMachine', () => {

  let machine: Interpreter<LoanContext, any, LoanEvent, LoanState>;

  const mockLoanRequest: LoanRequest = {
    uri: 'https://loan.uri',
    from: 'https://send.webid',
    to: 'https://receiver.webid',
    createdAt: Date.now().toString(),
    collection: 'https://collection.uri',
  };

  (services as any).loadRequests = jest.fn().mockResolvedValue([]);
  (services as any).createRequest = jest.fn().mockImplementation(async (request: LoanRequest) => request);
  (services as any).acceptRequest = jest.fn().mockImplementation(async (request: LoanRequest) => request);
  (services as any).rejectRequest = jest.fn().mockImplementation(async (request: LoanRequest) => request);

  beforeEach(() => {

    jest.clearAllMocks();
    machine = interpret(createMachine<LoanContext, LoanEvent, LoanState>(loanMachine).withContext({}));

  });

  afterEach(() => machine.stop());

  it('should instantiate', () => {

    machine.start();

    expect(machine).toBeTruthy();

    machine.stop();

  });

  describe(`${LoanStates.LOADING_LOAN_REQUESTS}`, () => {

    it(`should transition to ${LoanStates.LOAN_REQUEST_OVERVIEW} and invoke loadRequests`, async () => {

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return resolve();
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();
      expect(services.loadRequests).toHaveBeenCalledTimes(1);

    });

  });

  describe(`${LoanStates.LOAN_REQUEST_OVERVIEW}`, () => {

    it(`should transition to ${LoanStates.LOAN_REQUEST_CREATION} on ${LoanEvents.CLICKED_NEW_LOAN_REQUEST}`, async () => {

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(LoanStates.LOAN_REQUEST_CREATION)) return resolve();

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return machine.send(new ClickedNewLoanRequestEvent());
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();

    });

    it(`should transition to ${LoanStates.LOAN_REQUEST_DETAIL} on ${LoanEvents.CLICKED_LOAN_REQUEST_DETAIL} and assign loanRequest`, async () => {

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(LoanStates.LOAN_REQUEST_DETAIL)) return resolve();

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return machine.send(new ClickedLoanRequestDetailEvent(mockLoanRequest));
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();
      expect(machine.state.context).toEqual(expect.objectContaining({ loanRequest: mockLoanRequest }));

    });

  });

  describe(`${LoanStates.LOAN_REQUEST_DETAIL}`, () => {

    it.each([
      [ LoanStates.LOAN_REQUEST_CREATION, LoanEvents.CLICKED_NEW_LOAN_REQUEST, new ClickedNewLoanRequestEvent() ],
      [ LoanStates.LOAN_REQUEST_OVERVIEW, LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW, new ClickedLoanRequestOverviewEvent() ],
      [ LoanStates.ACCEPTING_LOAN_REQUEST, LoanEvents.CLICKED_ACCEPTED_LOAN_REQUEST, new ClickedAcceptedLoanRequestEvent(mockLoanRequest) ],
      [ LoanStates.REJECTING_LOAN_REQUEST, LoanEvents.CLICKED_REJECTED_LOAN_REQUEST, new ClickedRejectedLoanRequestEvent(mockLoanRequest) ],
    ])('should transition to %s on %s', async (desiredState, e, event: LoanEvent) => {

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(desiredState)) return resolve();

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return machine.send(new ClickedLoanRequestDetailEvent(mockLoanRequest));
          if(state.matches(LoanStates.LOAN_REQUEST_DETAIL)) return machine.send(event);
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();

    });

  });

  describe(`${LoanStates.LOAN_REQUEST_CREATION}`, () => {

    it.each([
      [ LoanStates.LOAN_REQUEST_OVERVIEW, LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW, new ClickedLoanRequestOverviewEvent() ],
      [ LoanStates.SENDING_LOAN_REQUEST, LoanEvents.CLICKED_SEND_LOAN_REQUEST, new ClickedSendLoanRequestEvent(mockLoanRequest) ],
    ])('should transition to %s on %s', async (desiredState, e, event: LoanEvent) => {

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(desiredState)) return resolve();

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return machine.send(new ClickedNewLoanRequestEvent());
          if(state.matches(LoanStates.LOAN_REQUEST_CREATION)) return machine.send(event);
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();

    });

  });

  describe(`${LoanStates.SENDING_LOAN_REQUEST}`, () => {

    it(`should transition to ${LoanStates.LOAN_REQUEST_OVERVIEW} and invoke createRequest`, async () => {

      let initialOverviewLoaded = false;

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW) && initialOverviewLoaded) return resolve();

          if(state.matches(LoanStates.LOAN_REQUEST_CREATION)) return machine.send(new ClickedSendLoanRequestEvent(mockLoanRequest));
          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) initialOverviewLoaded = true;
          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return machine.send(new ClickedNewLoanRequestEvent());
          if(state.matches(LoanStates.SENDING_LOAN_REQUEST)) return;
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();
      expect(services.createRequest).toHaveBeenCalledTimes(1);

    });

  });

  describe(`${LoanStates.ACCEPTING_LOAN_REQUEST}`, () => {

    it(`should transition to ${LoanStates.LOAN_REQUEST_OVERVIEW} and invoke acceptRequest`, async () => {

      let initialOverviewLoaded = false;

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW) && initialOverviewLoaded) return resolve();

          if(state.matches(LoanStates.LOAN_REQUEST_DETAIL)) return machine.send(new ClickedAcceptedLoanRequestEvent(mockLoanRequest));
          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) initialOverviewLoaded = true;
          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return machine.send(new ClickedLoanRequestDetailEvent(mockLoanRequest));
          if(state.matches(LoanStates.ACCEPTING_LOAN_REQUEST)) return;
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();
      expect(services.acceptRequest).toHaveBeenCalledTimes(1);

    });

  });

  describe(`${LoanStates.REJECTING_LOAN_REQUEST}`, () => {

    it(`should transition to ${LoanStates.LOAN_REQUEST_OVERVIEW} and invoke rejectRequest`, async () => {

      let initialOverviewLoaded = false;

      const transitionCheck = new Promise<void>((resolve, reject) => {

        machine.onTransition((state) => {

          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW) && initialOverviewLoaded) return resolve();

          if(state.matches(LoanStates.LOAN_REQUEST_DETAIL)) return machine.send(new ClickedRejectedLoanRequestEvent(mockLoanRequest));
          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) initialOverviewLoaded = true;
          if(state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)) return machine.send(new ClickedLoanRequestDetailEvent(mockLoanRequest));
          if(state.matches(LoanStates.REJECTING_LOAN_REQUEST)) return;
          if(state.matches(LoanStates.LOADING_LOAN_REQUESTS)) return;
          reject();

        });

      });

      machine.start();
      await expect(transitionCheck).resolves.toBeUndefined();
      expect(services.rejectRequest).toHaveBeenCalledTimes(1);

    });

  });

});
