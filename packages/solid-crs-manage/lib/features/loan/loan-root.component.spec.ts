/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { define, hydrate } from '@digita-ai/dgt-components';
import { Collection, CollectionStore, ConsoleLogger, LoanRequest, Logger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanRootComponent } from './loan-root.component';
import { ClickedImportCollection, ClickedLoanRequestOverviewAcceptedEvent, ClickedLoanRequestOverviewIncomingEvent, ClickedNewLoanRequestEvent } from './loan.events';
import { LoanStates } from './loan.states';
import * as services from './loan.services';

(services as any).loadRequests = jest.fn().mockResolvedValue([]);
(services as any).createRequest = jest.fn().mockImplementation(async (request: LoanRequest) => request);
(services as any).acceptRequest = jest.fn().mockImplementation(async (request: LoanRequest) => request);
(services as any).rejectRequest = jest.fn().mockImplementation(async (request: LoanRequest) => request);

describe('LoanRootComponent', () => {

  let component: LoanRootComponent;
  const tag = 'nde-loan-root';
  const translator = { translate: (input: string) => input };
  const logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  const mockCollectionStore: CollectionStore = {
    get: jest.fn(async () => ({})),
  } as any;

  const mockLoanRequest: LoanRequest = {
    uri: 'https://loan.request.com',
    type: 'https://www.w3.org/ns/activitystreams#Offer',
  } as any;

  beforeEach(() => {

    jest.clearAllMocks();
    define(tag, hydrate(LoanRootComponent)(translator, logger, {}, mockCollectionStore));
    component = document.createElement(tag) as LoanRootComponent;
    component.loanRequest = mockLoanRequest;

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(LoanRootComponent);

  });

  describe('onNewLoanRequest', () => {

    it('should send ClickedNewLoanRequestEvent', () => {

      component['actor'].send = jest.fn();
      component.onNewLoanRequest();
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedNewLoanRequestEvent());

    });

  });

  describe('onLoanRequestOverviewIncoming', () => {

    it('should send ClickedLoanRequestOverviewIncomingEvent', () => {

      component['actor'].send = jest.fn();
      component.onLoanRequestOverviewIncoming();
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedLoanRequestOverviewIncomingEvent());

    });

  });

  describe('onLoanRequestOverviewAccepted', () => {

    it('should send ClickedLoanRequestOverviewAcceptedEvent', () => {

      component['actor'].send = jest.fn();
      component.onLoanRequestOverviewAccepted();
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedLoanRequestOverviewAcceptedEvent());

    });

  });

  describe('onImportCollection', () => {

    it('should dispatch CustomEvent import-collection', () => {

      const mockCollection: Collection = {
        name: 'collection',
        description: 'description',
        inbox: 'inbox',
        publisher: 'publisher',
        uri: 'https://uri.uri',
        distribution: 'distribution',
      } as any;

      component['actor'].send = jest.fn();
      component.onImportCollection({ detail: mockCollection } as any);
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedImportCollection(mockCollection));

    });

  });

  describe('HTML', () => {

    it(`should render loan-overview-component when ${LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING}`, async () => {

      (component.state as any) = {
        matches: jest.fn((state) => state === LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING),
      };

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).toContain('<nde-loan-overview-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-creation-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-detail-component');

    });

    it(`should render loan-overview-component when ${LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED}`, async () => {

      (component.state as any) = {
        matches: jest.fn((state) => state === LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED),
      };

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).toContain('<nde-loan-overview-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-creation-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-detail-component');

    });

    it(`should render loan-detail-component when ${LoanStates.LOAN_REQUEST_DETAIL}`, async () => {

      (component.state as any) = {
        matches: jest.fn((state) => state === LoanStates.LOAN_REQUEST_DETAIL),
      };

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-overview-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-creation-component');
      expect(component.shadowRoot.innerHTML).toContain('<nde-loan-detail-component');

    });

    it(`should render loan-creation-component when ${LoanStates.LOAN_REQUEST_CREATION}`, async () => {

      (component.state as any) = {
        matches: jest.fn((state) => state === LoanStates.LOAN_REQUEST_CREATION),
      };

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-overview-component');
      expect(component.shadowRoot.innerHTML).toContain('<nde-loan-creation-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-detail-component');

    });

  });

});
