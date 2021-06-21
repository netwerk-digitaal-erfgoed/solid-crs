import { triggerAsyncId } from 'async_hooks';
import { css, CSSResult, html, internalProperty, property, PropertyValues, query, TemplateResult, unsafeCSS } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ArgumentError, Translator, debounce } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Loading, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { FormContext, FormRootStates, FormSubmissionStates, FormValidationStates } from './form.machine';
import { FormValidatorResult } from './form-validator-result';
import { FormEvent, FormEvents, FormUpdatedEvent } from './form.events';

/**
 * A component which shows the details of a single collection.
 */
export class FormElementComponent<T> extends RxLitElement {

  /**
   * All input elements slotted in the form element.
   */
  @internalProperty()
  inputs: HTMLInputElement[];

  /**
   * The slot element which contains the input field.
   */
  @query('slot[name="input"]')
  inputSlot: HTMLSlotElement;

  /**
   * Decides whether a border should be shown around the content
   */
  @property({ type: Boolean })
  public inverse = false;

  /**
   * Decides whether the label should be shown
   */
  @property({ type: Boolean })
  public showLabel = true;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The name of the data attribute edited by the form element.
   */
  @property({ type: String })
  public field: keyof T;

  /**
   * The element's form validation results.
   */
  @internalProperty()
  public validationResults: FormValidatorResult[];

  /**
   * Indicates if the element's loading icon should be shown.
   */
  @internalProperty()
  public showLoading = false;

  /**
   * Indicates if the form should submit on keypress = enter.
   */
  @internalProperty()
  public submitOnEnter = true;

  /**
   * Indicates if the form's input should be locked.
   */
  @internalProperty()
  public lockInput = false;

  /**
   * Timeout to use when debouncing input.
   */
  @property({ type: Number })
  public debounceTimeout = 500;

  /**
   * The element's data.
   */
  @internalProperty()
  public data: T;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: SpawnedActorRef<FormEvent, State<FormContext<T>>>;

  /**
   * Decides whether validation results should be shown below the form element
   * When false, only shows a yellow border to the left of the component
   */
  @property({ type: Boolean })
  public showValidation = true;

  /**
   * Hook called on every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed.has('actor') && this.actor) {

      // Subscribes to the field's validation results.
      this.subscribe('validationResults', from(this.actor).pipe(
        map((state) => state.context?.validation?.filter((result) => result.field === this.field)),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('data', from(this.actor).pipe(
        map((state) => state.context?.data),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('showLoading', from(this.actor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING) || state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.VALIDATION]: FormValidationStates.VALIDATING,
          },
        })),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('lockInput', from(this.actor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING) || state.matches(FormSubmissionStates.SUBMITTED)),
      ));

      this.bindActorToInput(this.inputSlot, this.actor, this.field, this.data);

    }

    /**
     * Update the disabled state of the input elements.
     */
    if(changed.has('lockInput')) {

      this.inputs?.forEach((element) => element.disabled = this.lockInput);

    }

  }

  /**
   * Binds default data and event listener for input form.
   */
  bindActorToInput(
    slot: HTMLSlotElement,
    actor: SpawnedActorRef<FormEvent, State<FormContext<T>>>,
    field: keyof T,
    data: T
  ): void {

    if (!slot) {

      throw new ArgumentError('Argument slot should be set.', slot);

    }

    if (!actor) {

      throw new ArgumentError('Argument actor should be set.', actor);

    }

    if (!field) {

      throw new ArgumentError('Argument field should be set.', field);

    }

    if (!data) {

      throw new ArgumentError('Argument data should be set.', data);

    }

    this.inputs = slot.assignedNodes({ flatten: true })?.filter(
      (element) => element instanceof HTMLInputElement ||
                    element instanceof HTMLSelectElement ||
                    element instanceof HTMLTextAreaElement
    ).map((element) => element as HTMLInputElement);

    this.inputs?.forEach((element) => {

      const fieldData = data[this.field];

      if (element instanceof HTMLSelectElement) {

        // Set the input field's default value.
        element.namedItem(fieldData && (typeof fieldData === 'string' || typeof fieldData === 'number') ? fieldData.toString() : '').selected = true;

        // Send event when input field's value changes.
        element.addEventListener('input', () => actor.send({ type: FormEvents.FORM_UPDATED, value: element.options[element.selectedIndex].id, field } as FormUpdatedEvent));

      } else {

        // Set the input field's default value.
        element.value = fieldData && (typeof fieldData === 'string' || typeof fieldData === 'number') ? fieldData.toString() : '';

        // Send event when input field's value changes.
        element.addEventListener(
          'input',
          debounce(() => {

            let elementValue;

            if (typeof fieldData === 'number') {

              elementValue = isNaN(+element.value) ? NaN : +element.value;

            } else {

              elementValue = element.value.trim();

            }

            actor.send({ type: FormEvents.FORM_UPDATED, value: elementValue, field } as FormUpdatedEvent);

          }, this.debounceTimeout),
        );

      }

      // Listen for Enter presses to submit
      if (this.submitOnEnter) {

        element.addEventListener('keypress', (event) => {

          if (event.key === 'Enter' && this.validationResults?.length < 1) {

            actor.send({ type: FormEvents.FORM_SUBMITTED });

          }

        });

      }

    });

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <div class="form-element">
      ${this.showLabel
    ? html`
          <div class="label">
            <slot name="label"></slot>
          </div>
        ` : ''
}     
      <div class="content ${!this.showValidation && this.validationResults?.length > 0  ? 'no-validation' : ''}">
        <div class="field ${this.inverse ? 'no-border' : ''}">
          <slot name="input"></slot>
          <div class="icon">
            ${this.showLoading ? html`<div class="loading">${ unsafeSVG(Loading) }</div>` : html`<slot name="icon"></slot>`}
          </div>
        </div>
        <div class="action">
          <slot name="action" class="${this.inverse ? 'no-border' : ''}"></slot>
        </div>
      </div>
      <div class="help" ?hidden="${this.validationResults && this.validationResults?.length > 0}">
        <slot name="help"></slot>
      </div>
      <div class="results" ?hidden="${!this.showValidation || !this.validationResults || this.validationResults.length === 0}">
        ${this.validationResults?.map((result) => html`<div class="result">${this.translator ? this.translator.translate(result.message) : result.message}</div>`)}
      </div>
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
        :root {
          display: block;
        }

        .loading svg .loadCircle {
          stroke: var(--colors-primary-normal);
        }
        .no-border, .no-border ::slotted(*) {
          border: none !important;
        }
        .no-validation {
          border-bottom: solid 2px var(--colors-status-warning);
        }
        .form-element {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .form-element .label {
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--gap-small);
        }
        .form-element .content {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          background-color: var(--colors-background-light)
        }
        .form-element .content .action ::slotted(button){
          height: 100%;
        }
        .form-element .content .field {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          justify-content: space-between;
          flex: 1 0;
          border: var(--border-normal) solid var(--colors-foreground-normal);
        }
        .form-element .content .field ::slotted(*) {
          padding: 0 var(--gap-normal);
          flex: 1 0;
          height: 44px;
        }
        .form-element .content .field ::slotted(input),
        .form-element .content .field ::slotted(select), 
        .form-element .content .field ::slotted(textarea) {
          box-sizing: border-box;
        }
        .form-element .content .field ::slotted(textarea) {
          padding: var(--gap-normal);
          height: 132px;
        }
        .form-element .content .field .icon {
          height: 100%;
          display: flex;
          align-items: center;
        }
        .form-element .content .field .icon ::slotted(*), .form-element .content .field .icon div svg  {
          padding-right: var(--gap-normal);
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
          height: var(--gap-normal);
          width: var(--gap-normal);
        }
        .form-element .results .result {
          background-color: var(--colors-status-warning);
          padding: var(--gap-tiny) var(--gap-normal);
          font-size: var(--font-size-small);
        }
      `,
    ];

  }

}
