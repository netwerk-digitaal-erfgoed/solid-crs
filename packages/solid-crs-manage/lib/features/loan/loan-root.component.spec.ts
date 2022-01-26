/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { define, hydrate } from '@digita-ai/dgt-components';
import { ConsoleLogger, LoanRequest, Logger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanRootComponent } from './loan-root.component';
import { ClickedLoanRequestDetailEvent, ClickedLoanRequestOverviewEvent, ClickedNewLoanRequestEvent } from './loan.events';
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

  beforeEach(() => {

    jest.clearAllMocks();
    define(tag, hydrate(LoanRootComponent)(translator, logger));
    component = document.createElement(tag) as LoanRootComponent;

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
      component['onNewLoanRequest']();

      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedNewLoanRequestEvent());

    });

  });

  describe('onLoanRequestOverview', () => {

    it('should send ClickedLoanRequestOverviewEvent', () => {

      component['actor'].send = jest.fn();
      component['onLoanRequestOverview']();

      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedLoanRequestOverviewEvent());

    });

  });

  describe('HTML', () => {

    it(`should render loan-overview-component when ${LoanStates.LOAN_REQUEST_OVERVIEW}`, async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).toContain('<nde-loan-overview-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-creation-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-detail-component');

    });

    it(`should render loan-detail-component when ${LoanStates.LOAN_REQUEST_DETAIL}`, async () => {

      component['actor'].send(new ClickedLoanRequestDetailEvent({} as any));

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-overview-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-creation-component');
      expect(component.shadowRoot.innerHTML).toContain('<nde-loan-detail-component');

    });

    it(`should render loan-creation-component when ${LoanStates.CREATING_LOAN_REQUEST}`, async () => {

      component['actor'].send(new ClickedNewLoanRequestEvent());

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-overview-component');
      expect(component.shadowRoot.innerHTML).toContain('<nde-loan-creation-component');
      expect(component.shadowRoot.innerHTML).not.toContain('<nde-loan-detail-component');

    });

  });

});
