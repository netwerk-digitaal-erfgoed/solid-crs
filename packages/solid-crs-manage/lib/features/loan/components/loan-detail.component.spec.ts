/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { define, hydrate } from '@digita-ai/dgt-components';
import { Collection, ConsoleLogger, LoanRequest, Logger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ClickedAcceptedLoanRequestEvent, ClickedLoanRequestOverviewAcceptedEvent, ClickedLoanRequestOverviewIncomingEvent, ClickedRejectedLoanRequestEvent } from '../loan.events';
import { LoanDetailComponent } from './loan-detail.component';

describe('LoanDetailComponent', () => {

  let component: LoanDetailComponent;
  const tag = 'nde-loan-detail';
  const translator = { translate: (input: string) => input };
  const logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  const mockLoanRequest: LoanRequest = {
    uri: 'https://loan.uri',
    from: 'https://send.webid',
    to: 'https://receiver.webid',
    createdAt: Date.now().toString(),
    collection: 'https://collection.uri',
    type: 'https://www.w3.org/ns/activitystreams#Offer',
  };

  const mockCollection: Collection = {
    name: 'collection',
    description: 'description',
    inbox: 'inbox',
    publisher: 'publisher',
    uri: 'https://uri.uri',
    distribution: 'distribution',
  } as any;

  const actor = new Promise((resolve) => resolve({ context: { loanRequest: undefined } }));

  beforeEach(() => {

    jest.clearAllMocks();
    define(tag, hydrate(LoanDetailComponent)(actor, translator, logger));
    component = document.createElement(tag) as LoanDetailComponent;
    component['actor'].send = jest.fn();

  });

  it('should instantiate', async () => {

    component.loanRequest = mockLoanRequest;
    component.collection = mockCollection;
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(LoanDetailComponent);

  });

  describe('onRejectLoanRequest', () => {

    it('should send ClickedLoanRequestDetailEvent', () => {

      component.loanRequest = mockLoanRequest;
      component['onRejectLoanRequest']();
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedRejectedLoanRequestEvent(mockLoanRequest));

    });

    it('should not send ClickedLoanRequestDetailEvent when this.loanRequest is undefined', () => {

      component['onRejectLoanRequest']();
      expect(component['actor'].send).not.toHaveBeenCalled();

    });

  });

  describe('onAcceptLoanRequest', () => {

    it('should send ClickedLoanRequestDetailEvent', () => {

      component.loanRequest = mockLoanRequest;
      component['onAcceptLoanRequest']();
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedAcceptedLoanRequestEvent(mockLoanRequest));

    });

    it('should not send ClickedLoanRequestDetailEvent when this.loanRequest is undefined', () => {

      component['onAcceptLoanRequest']();
      expect(component['actor'].send).not.toHaveBeenCalled();

    });

  });

  describe('onImportCollection', () => {

    it('should send new CustomEvent', () => {

      component.loanRequest = {
        ...mockLoanRequest,
        type: 'https://www.w3.org/ns/activitystreams#Accept',
      };

      component.collection = mockCollection;
      component.dispatchEvent = jest.fn();
      component['onImportCollection']();
      const expectedEvent = new CustomEvent<Collection>('import-collection', { detail: mockCollection });
      expect(component.dispatchEvent).toHaveBeenCalledWith(expectedEvent);

    });

    it('should not send CustomEvent when this.loanRequest is undefined', () => {

      component['onImportCollection']();
      component.dispatchEvent = jest.fn();
      expect(component.dispatchEvent).not.toHaveBeenCalled();

    });

  });

  describe('onCancelImport', () => {

    it('should send ClickedLoanRequestOverviewEvent', () => {

      component['onCancelImport']();
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedLoanRequestOverviewAcceptedEvent());

    });

  });

  describe('HTML', () => {

    it(`should render an nde-large-card`, async () => {

      component.loanRequest = mockLoanRequest;
      component.collection = mockCollection;
      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.querySelectorAll('nde-large-card')).toHaveLength(1);

    });

    it(`should render different buttons when loanRequest.type = Accept `, async () => {

      component.loanRequest = {
        ...mockLoanRequest,
        type: 'https://www.w3.org/ns/activitystreams#Accept',
      };

      component.collection = mockCollection;
      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.querySelector('#button-container button.primary').innerHTML)
        .toContain('loan.detail.card.import');

    });

  });

});
