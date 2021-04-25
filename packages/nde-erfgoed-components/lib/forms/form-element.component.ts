import { css, html, internalProperty, property, PropertyValues } from 'lit-element';
import { Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from '../state/event';
import { FormContext, FormEvents, FormUpdatedEvent } from './form.machine';
import { FormValidationResult } from './form-validation-result';

/**
 * A component which shows the details of a single collection.
 */
export class FormElementComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The element's form validation results.
   */
  @property({type: String})
  public field: string;

  /**
   * The element's form validation results.
   */
  @internalProperty({type: Array})
  public validationResults: FormValidationResult[];

  /**
   * The element's data.
   */
  @internalProperty({type: Object})
  public data: any;

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
  public actor: SpawnedActorRef<Event<FormEvents>, State<FormContext<any>>>;

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        :root {
          display: block;
        }
        .form-element {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .form-element .content {
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }
        .form-element .content .field {
          display: flex;
          flex-direction: row;
          border: var(--border-normal) solid var(--colors-foreground-normal);
          padding: var(--gap-small) var(--gap-normal);
          height: 20px;
          align-items: center;
          flex: 1 0;
        }
        .form-element .label {
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--gap-small);
        }
        .form-element .content .field .input {
          flex: 1 0;
        }
        .form-element .content .field .icon {
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
        }
        .form-element .results .result {
          background-color: var(--colors-status-warning);
          padding: var(--gap-tiny) var(--gap-normal);
        }
      `,
    ];
  }

  /**
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    this.subscribe('validationResults', from(this.actor).pipe(
      map((state) => state.context?.validation?.filter((result) => result.field === this.field)),
    ));

    this.subscribe('data', from(this.actor).pipe(
      map((state) => state.context?.data),
    ));
  }

  handleInputSlotchange(slotchangeEvent: any) {
    const childNodes: NodeListOf<HTMLElement> = slotchangeEvent.target.assignedNodes({flatten: true});
    const node = childNodes?.length === 1 ? childNodes[0] : null;

    if(node && node instanceof HTMLInputElement) {
      const input = node as HTMLInputElement;
      input.value = this.data[this.field];
      input.addEventListener('input', () => this.actor.send({type: FormEvents.FORM_UPDATED, value: input.value, field: this.field} as FormUpdatedEvent));
    }
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <div class="form-element">
      <div class="label">
        <slot name="label"></slot>
      </div>
      <div class="content">
        <div class="field">
          <div class="input">
            <slot name="input" @slotchange=${this.handleInputSlotchange}></slot>
          </div>
          <div class="icon">
            <slot name="icon"></slot>
          </div>
        </div>
        <div class="action">
          <slot name="action"></slot>
        </div>
      </div>
      <div class="help" ?hidden="${this.validationResults && this.validationResults?.length > 0}">
        <slot name="help"></slot>
      </div>
      <div class="results" ?hidden="${!this.validationResults || this.validationResults.length === 0}">
        ${this.validationResults?.map((result) => html`<div class="result">${result.message}</div>`)}
      </div>
    </div>
  `;
  }
}

export default FormElementComponent;
