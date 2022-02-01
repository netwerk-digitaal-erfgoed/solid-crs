/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { define, FormCleanlinessStates, FormRootStates, FormSubmissionStates, FormSubmittedEvent, FormUpdatedEvent, FormValidationStates, hydrate } from '@digita-ai/dgt-components';
import { ConsoleLogger, LoanRequest, Logger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ClickedAcceptedLoanRequestEvent, ClickedLoanRequestOverviewEvent, ClickedRejectedLoanRequestEvent, ClickedSendLoanRequestEvent } from '../loan.events';
import { LoanCreationComponent } from './loan-creation.component';

describe('LoanCreationComponent', () => {

  let component: LoanCreationComponent;
  const tag = 'nde-loan-creation';
  const translator = { translate: (input: string) => input };
  const logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  const actor = new Promise((resolve) => resolve({ context: { } }));

  beforeEach(() => {

    jest.clearAllMocks();
    define(tag, hydrate(LoanCreationComponent)(actor, translator, logger));
    component = document.createElement(tag) as LoanCreationComponent;
    component['actor'].send = jest.fn();

  });

  it('should instantiate', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(component).toBeTruthy();
    expect(component).toBeInstanceOf(LoanCreationComponent);

  });

  describe('formActor', () => {

    it('should send ClickedSendLoanRequestEvent when the formMachine is done and submitted', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      const formSubmittedCheck = new Promise<void>((resolve, reject) => {

        component['formActor'].onTransition((state) => {

          if (state.matches(FormSubmissionStates.SUBMITTED)) return resolve();

        });

      });

      component['formActor'].send(new FormUpdatedEvent('collection', 'https://collection.co'));
      component['formActor'].send(new FormUpdatedEvent('description', 'descriptionString'));

      component['formActor'].send(new FormSubmittedEvent());

      await expect(formSubmittedCheck).resolves.toBeUndefined();

      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedSendLoanRequestEvent(
        expect.objectContaining({ collection: 'https://collection.co', description: 'descriptionString' })
      ));

    });

  });

  describe('formValidator', () => {

    const ctx = { data: { collection: 'https://collection.co', description: 'description' } };

    it('should return an empty array when no errors occur', async () => {

      const result = component['formValidator'](
        ctx,
        { field: 'collection' } as any
      );

      await expect(result).resolves.toHaveLength(0);

      const result2 = component['formValidator'](
        ctx,
        { field: 'description' } as any
      );

      await expect(result2).resolves.toHaveLength(0);

    });

    it('should return an empty array when context.data is undefined', async () => {

      const result = component['formValidator'](
        { data: undefined },
        { field: 'collection' } as any
      );

      await expect(result).resolves.toHaveLength(0);

    });

    it('should return an error message for the description field when the string is over 500 characters', async () => {

      const result = component['formValidator'](
        { data: { ...ctx.data, description: 'A'.repeat(501) } },
        { field: 'description' } as any
      );

      await expect(result).resolves.toHaveLength(1);
      expect((await result)[0]).toEqual(expect.objectContaining({ field: 'description' }));

    });

    it('should return an error message for the collection field when the string is not a valid URL', async () => {

      const result = component['formValidator'](
        { data: { ...ctx.data, collection: 'not-a-url' } },
        { field: 'collection' } as any
      );

      await expect(result).resolves.toHaveLength(1);
      expect((await result)[0]).toEqual(expect.objectContaining({ field: 'collection' }));

    });

  });

  describe('onCancelLoanRequestCreation', () => {

    it('should send ClickedLoanRequestOverviewEvent', () => {

      component['onCancelLoanRequestCreation']();
      expect(component['actor'].send).toHaveBeenCalledWith(new ClickedLoanRequestOverviewEvent());

    });

  });

  describe('onConfirmLoanRequestCreation', () => {

    it('should send FormSubmittedEvent to the child formActor', () => {

      component['formActor'].send = jest.fn();
      component['onConfirmLoanRequestCreation']();
      expect(component['formActor'].send).toHaveBeenCalledWith(new FormSubmittedEvent());

    });

  });

  describe('HTML', () => {

    it(`should render an nde-large-card`, async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.shadowRoot.querySelectorAll('nde-large-card')).toHaveLength(1);

    });

    it('should call this.onCancelLoanRequestCreation() when the cancel button is clicked', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      const spy = jest.spyOn(component, 'onCancelLoanRequestCreation');
      const button: HTMLElement = component.shadowRoot.querySelector('button.gray');
      button.click();

      expect(spy).toHaveBeenCalledTimes(1);

    });

    it('should call this.onConfirmLoanRequestCreation() when the confirm button is clicked and the form in valid', async () => {

      window.document.body.appendChild(component);
      component.validForm = true;
      await component.updateComplete;

      const spy = jest.spyOn(component, 'onConfirmLoanRequestCreation');
      const button: HTMLElement = component.shadowRoot.querySelector('button.primary');
      button.click();

      expect(spy).toHaveBeenCalledTimes(1);

    });

    it('should not call this.onConfirmLoanRequestCreation() when the confirm button is clicked and the form is invalid', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      const spy = jest.spyOn(component, 'onConfirmLoanRequestCreation');
      const button: HTMLElement = component.shadowRoot.querySelector('button.primary');
      button.click();

      expect(spy).toHaveBeenCalledTimes(0);

    });

  });

});
