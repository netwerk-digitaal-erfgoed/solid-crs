/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { define, hydrate } from '@digita-ai/dgt-components';
import { ConsoleLogger, LoanRequest, Logger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ClickedLoanRequestDetailEvent } from '../loan.events';
import { LoanStates } from '../loan.states';
import { LoanOverviewComponent } from './loan-overview.component';

describe('LoanOverviewComponent', () => {

  let component: LoanOverviewComponent;
  const tag = 'nde-loan-overview';
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

  const actor = new Promise((resolve) => resolve({
    context: { loanRequests: [] },
    matches: jest.fn((state) => state === LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING),
  }));

  beforeEach(() => {

    jest.clearAllMocks();
    define(tag, hydrate(LoanOverviewComponent)(actor, translator, logger));
    component = document.createElement(tag) as LoanOverviewComponent;
    component['actor'].send = jest.fn();

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(LoanOverviewComponent);

  });

  describe('onLoanRequestClicked', () => {

    it('should send ClickedLoanRequestDetailEvent', () => {

      component['onLoanRequestClicked'](mockLoanRequest);
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedLoanRequestDetailEvent(mockLoanRequest));

    });

  });

  describe('HTML', () => {

    it(`should render an nde-large-card for every loan request in this.loanRequests`, async () => {

      component['loanRequests'] = [ mockLoanRequest, mockLoanRequest, mockLoanRequest ];
      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.querySelectorAll('nde-large-card')).toHaveLength(component['loanRequests'].length);
      expect(component.shadowRoot.querySelector('.empty')).toBe(null);

    });

    it('should render the .empty container when there are no requests', async () => {

      component.loanRequests = [ ];
      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.querySelector('.empty')).toBeDefined();
      expect(component.shadowRoot.querySelectorAll('nde-large-card')).toHaveLength(component['loanRequests'].length);

    });

    it('should call this.onLoanRequestClicked() when an nde-large-card is clicked', async () => {

      component['loanRequests'] = [ mockLoanRequest ];
      window.document.body.appendChild(component);
      await component.updateComplete;

      const spy = jest.spyOn(component, 'onLoanRequestClicked');
      const card: HTMLElement = component.shadowRoot.querySelector('nde-large-card');
      card.click();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockLoanRequest);

    });

    it('should show the right empty message', async () => {

      component.loanRequests = [ ];
      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).toContain('message-incoming');
      expect(component.shadowRoot.innerHTML).not.toContain('message-accepted');

      component.state = {
        context: { loanRequests: [] },
        matches: jest.fn((state) => state === LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED),
      } as any;

      await component.updateComplete;

      expect(component.shadowRoot.innerHTML).not.toContain('message-incoming');
      expect(component.shadowRoot.innerHTML).toContain('message-accepted');

    });

  });

});
