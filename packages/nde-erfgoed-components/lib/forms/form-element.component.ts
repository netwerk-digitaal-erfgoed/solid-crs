import { css, html, internalProperty, property, PropertyValues, unsafeCSS } from 'lit-element';
import { ArgumentError, Translator } from '@digita-ai/nde-erfgoed-core';
import { SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Theme } from '@digita-ai/nde-erfgoed-theme';
import { Event } from '../state/event';
import { FormContext } from './form.machine';
import { FormValidatorResult } from './form-validator-result';
import { FormEvents, FormUpdatedEvent } from './form.events';

/**
 * A component which shows the details of a single collection.
 */
export class FormElementComponent<T> extends RxLitElement {

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The name of the data attribute edited by the form element.
   */
  @property({type: String})
  public field: keyof T;

  /**
   * The element's form validation results.
   */
  @internalProperty()
  public validationResults: FormValidatorResult[];

  /**
   * The element's data.
   */
  @internalProperty()
  public data: T;

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
  public actor: SpawnedActorRef<Event<FormEvents>, State<FormContext<T>>>;

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
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
          margin-left: var(--gap-normal);
        }
        .form-element .results .result {
          background-color: var(--colors-status-warning);
          padding: var(--gap-tiny) var(--gap-normal);
          font-size: var(--font-size-small);
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

    if (!this.actor) {
      throw new ArgumentError('Argument this.actor should be set.', this.actor);
    }

    // Subscribes to the field's validation results.
    this.subscribe('validationResults', from(this.actor).pipe(
      map((state) => state.context?.validation?.filter((result) => result.field === this.field)),
    ));

    // Subscribes to data in the actor's context.
    this.subscribe('data', from(this.actor).pipe(
      map((state) => state.context?.data),
    ));
  }

  /**
   * Sets default data and event listener for input form.
   *
   * @param slotchangeEvent Event fired when slot is changed.
   */
  handleInputSlotchange(slotchangeEvent: UIEvent) {
    if (!slotchangeEvent || !slotchangeEvent.target) {
      throw new ArgumentError('Argument slotchangeEvent should be set.', slotchangeEvent);
    }

    if (!this.field) {
      throw new ArgumentError('Argument this.field should be set.', this.field);
    }

    if (!this.data) {
      throw new ArgumentError('Argument this.data should be set.', this.data);
    }

    if (!this.actor) {
      throw new ArgumentError('Argument this.actor should be set.', this.actor);
    }

    if(!typeof slotchangeEvent.target || !(slotchangeEvent.target instanceof HTMLSlotElement)) {
      throw new ArgumentError('Argument slotchangeEvent.target should be set with a HTMLSlotElement.', this.actor);
    }

    const childNodes: Node[] = slotchangeEvent.target.assignedNodes({flatten: true});

    childNodes.forEach((node) => {
      if(node && node instanceof HTMLInputElement) {
        // Set the input field's default value.
        const fieldData = this.data[this.field];
        node.value = typeof fieldData === 'string' ? fieldData : '';

        // Send event when input field's value changes.
        node.addEventListener('input', () => this.actor.send({type: FormEvents.FORM_UPDATED, value: node.value, field: this.field} as FormUpdatedEvent));
      }
    });
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
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
        ${this.validationResults?.map((result) => html`<div class="result">${this.translator ? this.translator.translate(result.message) : result.message}</div>`)}
      </div>
    </div>
  `;
  }
}

export default FormElementComponent;
