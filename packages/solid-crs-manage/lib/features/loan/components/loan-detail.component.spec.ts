/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { define, hydrate } from '@digita-ai/dgt-components';
import { ConsoleLogger, LoanRequest, Logger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Interpreter } from 'xstate';
import { LoanContext } from '../loan.context';
import { ClickedAcceptedLoanRequestEvent, ClickedLoanRequestDetailEvent, ClickedRejectedLoanRequestEvent, LoanEvent } from '../loan.events';
import { LoanState, LoanStateSchema } from '../loan.states';
import { LoanDetailComponent } from './loan-detail.component';

describe('LoanDetailComponent', () => {

  let component: LoanDetailComponent;
  const tag = 'nde-loan-overview';
  const translator = { translate: (input: string) => input };
  const logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  const mockLoanRequest: LoanRequest = {
    uri: 'https://loan.uri',
    from: 'https://send.webid',
    to: 'https://receiver.webid',
    createdAt: Date.now().toString(),
    collection: 'https://collection.uri',
  };

  const actor = new Promise((resolve) => resolve({ context: { loanRequest: undefined } }));

  beforeEach(() => {

    jest.clearAllMocks();
    define(tag, hydrate(LoanDetailComponent)(actor, translator, logger));
    component = document.createElement(tag) as LoanDetailComponent;

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(LoanDetailComponent);

  });

  describe('onRejectLoanRequest', () => {

    it('should send ClickedLoanRequestDetailEvent', () => {

      component.loanRequest = mockLoanRequest;
      component['actor'].send = jest.fn();
      component['onRejectLoanRequest']();

      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedRejectedLoanRequestEvent(mockLoanRequest));

    });

    it('should not send ClickedLoanRequestDetailEvent when this.loanRequest is undefined', () => {

      component['actor'].send = jest.fn();
      component['onRejectLoanRequest']();

      expect(component['actor'].send).not.toHaveBeenCalled();

    });

  });

  describe('onAcceptLoanRequest', () => {

    it('should send ClickedLoanRequestDetailEvent', () => {

      component.loanRequest = mockLoanRequest;
      component['actor'].send = jest.fn();
      component['onAcceptLoanRequest']();

      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedAcceptedLoanRequestEvent(mockLoanRequest));

    });

    it('should not send ClickedLoanRequestDetailEvent when this.loanRequest is undefined', () => {

      component['actor'].send = jest.fn();
      component['onAcceptLoanRequest']();

      expect(component['actor'].send).not.toHaveBeenCalled();

    });

  });

  describe('HTML', () => {

    it(`should render an nde-large-card`, async () => {

      component['loanRequest'] = mockLoanRequest;
      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.querySelectorAll('nde-large-card')).toHaveLength(1);

    });

    it('should call this.onRejectLoanRequest() when the reject button is clicked', async () => {

      component['loanRequest'] = mockLoanRequest;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const spy = jest.spyOn(component, 'onRejectLoanRequest');
      const button: HTMLElement = component.shadowRoot.querySelector('button.gray');
      button.click();

      expect(spy).toHaveBeenCalledTimes(1);

    });

    it('should call this.onAcceptLoanRequest() when the accept button is clicked', async () => {

      component['loanRequest'] = mockLoanRequest;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const spy = jest.spyOn(component, 'onAcceptLoanRequest');
      const button: HTMLElement = component.shadowRoot.querySelector('button.primary');
      button.click();

      expect(spy).toHaveBeenCalledTimes(1);

    });

  });

});
