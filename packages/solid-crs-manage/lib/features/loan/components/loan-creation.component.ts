import { html, css, TemplateResult, CSSResult, unsafeCSS, state } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { CollectionStore, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { createMachine, interpret, Interpreter, StateMachine } from 'xstate';
import { define, FormCleanlinessStates, FormContext, FormEvent, formMachine, FormRootStates, FormState, FormStateSchema, FormSubmissionStates, FormSubmittedEvent, FormUpdatedEvent, FormValidationStates, FormValidatorResult, hydrate } from '@digita-ai/dgt-components';
import { FormElementComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { from, map } from 'rxjs';
import { LoanContext } from '../loan.context';
import { LoanState, LoanStateSchema } from '../loan.states';
import { ClickedLoanRequestOverviewIncomingEvent, ClickedSendLoanRequestEvent, LoanEvent } from '../loan.events';
import { LoanRequestCreationArgs } from '../models/loan-request-creation-args';

export class LoanCreationComponent extends RxLitElement {

  // eslint-disable-next-line max-len
  private formMachine: StateMachine<FormContext<LoanRequestCreationArgs>, FormStateSchema<LoanRequestCreationArgs>, FormEvent, FormState<LoanRequestCreationArgs>>;
  // eslint-disable-next-line max-len
  private formActor: Interpreter<FormContext<LoanRequestCreationArgs>, FormStateSchema<LoanRequestCreationArgs>, FormEvent, FormState<LoanRequestCreationArgs>>;

  @state() collectionStore: CollectionStore;
  @state() validForm = false;

  constructor(
    private actor: Interpreter<LoanContext, LoanStateSchema, LoanEvent, LoanState>,
    public translator: Translator,
    public logger: Logger,
  ) {

    super();

    this.subscribe('collectionStore', from(this.actor).pipe(
      map((actorState) => actorState.context.collectionStore),
    ));

    this.initFormMachine();
    define('nde-form-element', hydrate(FormElementComponent)(this.formActor));

  }

  private initFormMachine(): void {

    this.formMachine = createMachine(
      formMachine<LoanRequestCreationArgs>(this.formValidator(this.collectionStore)) as any
    ).withContext({
      data: { collection: '', description: '' },
      original: { collection: '', description: '' },
    }) as any;

    this.formActor = interpret(this.formMachine, { devTools: true }).onDone((event) => {

      this.actor.send(new ClickedSendLoanRequestEvent(event.data?.data));

    });

    this.subscribe('validForm', from(this.formActor).pipe(
      map((formState) => formState.matches({
        [FormSubmissionStates.NOT_SUBMITTED]: {
          [FormRootStates.VALIDATION]: FormValidationStates.VALID,
          [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
        },
      })),
    ));

    this.formActor.start();

  }

  formValidator(collectionStore: CollectionStore): (
    context: FormContext<LoanRequestCreationArgs>,
    event: FormEvent,
  ) => Promise<FormValidatorResult[]> {

    return async (
      context: FormContext<LoanRequestCreationArgs>,
      event: FormEvent,
    ) => {

      if (!context.data) return [];

      const { collection, description } = context.data;
      const updatedField = (event as FormUpdatedEvent).field;

      let results: FormValidatorResult[] = [ ... (context.validation ?? []) ];

      // description checks
      if (updatedField === 'description') {

        // clear existing validation results for description
        results = results.filter((result) => result.field !== 'description');

        if (description?.length > 500) {

          results.push({ message: 'loan.creation.card.form.description-too-long', field: 'description' });

        }

      }

      // Always check collection as it is a required field
      // clear existing validation results for collection
      results = results.filter((result) => result.field !== 'collection');

      try {

        await collectionStore.get(collection);

      } catch (error: unknown) {

        results.push({ message: 'loan.creation.card.form.invalid-collection-url', field: 'collection' });

      }

      return results;

    };

  }

  onCancelLoanRequestCreation(): void {

    this.actor.send(new ClickedLoanRequestOverviewIncomingEvent());

  }

  onConfirmLoanRequestCreation(): void {

    this.formActor.send(new FormSubmittedEvent());

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      <nde-form-element
        .showLabel="${true}"
        .showValidation="${true}"
        field="collection"
        .translator="${this.translator}"
        .actor="${this.formActor}"
      >
        <label slot="label">
          ${this.translator?.translate('loan.creation.card.enter-collection')}
        </label>
        <input slot="input" name="collection">
      </nde-form-element>

      <nde-form-element
        .showLabel="${true}"
        .showValidation="${false}"
        field="description"
        .translator="${this.translator}"
        .actor="${this.formActor}"
      >
        <label slot="label">
          ${this.translator?.translate('loan.creation.card.description')}
        </label>
        <textarea slot="input"></textarea>
      </nde-form-element> 

      <div id="button-container">
        <button class="gray" @click="${() => this.onCancelLoanRequestCreation()}">
          ${this.translator?.translate('loan.creation.card.cancel')}
        </button>
        <button class="primary"
          @click="${this.onConfirmLoanRequestCreation}"
          ?disabled="${!this.validForm}"
        >
          ${this.translator?.translate('loan.creation.card.confirm')}
        </button>
      </div>
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          display: flex;
          flex-direction: column;
          gap: var(--gap-large);
        }
        #button-container {
          width: 100%;
          display: flex;
          gap: var(--gap-normal);
        }
        #button-container > button {
          flex: 1 0;
        }
      `,
    ];

  }

}
