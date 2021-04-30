import { css, html, internalProperty, property, PropertyValues, query, unsafeCSS } from 'lit-element';
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
   * The slot element which contains the input field.
   */
  @query('slot[name="input"]')
  inputSlot: HTMLSlotElement;

  /**
   * Decides whether a border should be shown around the content
   */
  @property()
  public inverse = false;

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
   * Hook called on every update after connection to the DOM.
   */
  updated(changed: PropertyValues) {
    super.updated(changed);

    if(changed.has('actor')) {
      // Subscribes to the field's validation results.
      this.subscribe('validationResults', from(this.actor).pipe(
        map((state) => state.context?.validation?.filter((result) => result.field === this.field)),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('data', from(this.actor).pipe(
        map((state) => state.context?.data),
      ));

      this.bindActorToInput(this.inputSlot, this.actor, this.field, this.data);
    }
  }

  /**
   * Binds default data and event listener for input form.
   */
  bindActorToInput(slot: HTMLSlotElement, actor: SpawnedActorRef<Event<FormEvents>, State<FormContext<T>>>, field: keyof T, data: T) {
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

    const childNodes: Node[] = slot.assignedNodes({flatten: true});

    childNodes.forEach((node) => {
      if(node && node instanceof HTMLInputElement) {
        // Set the input field's default value.
        const fieldData = data[this.field];
        node.value = typeof fieldData === 'string' ? fieldData : '';

        // Send event when input field's value changes.
        node.addEventListener('input', () => actor.send({type: FormEvents.FORM_UPDATED, value: node.value, field} as FormUpdatedEvent));
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
        <div class="field ${this.inverse ? 'no-border' : ''}">
          <div class="input">
            <slot name="input"></slot>
          </div>
          <div class="icon">
            <slot name="icon"></slot>
          </div>
        </div>
        <div class="action">
          <slot name="action" class="${this.inverse ? 'no-border' : ''}"></slot>
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
        .no-border, .no-border ::slotted(*) {
          border: none !important;
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
          height: 44px;
          background-color: var(--colors-background-light)
        }
        .form-element .content .field {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          justify-content: space-between;
          flex: 1 0;
          border: var(--border-normal) solid var(--colors-foreground-normal);
        }
        .form-element .content .field .input {
          padding: 0 var(--gap-normal);
          width: 100%;
          height: 100%;
        }
        .form-element .content .field .input ::slotted(input) {
          width: 100%;
          height: 100%;
        }
        .form-element .content .field .icon {
          padding: 0 var(--gap-normal);
          height: 100%;
          display: flex;
          align-items: center;
        }
        .form-element .content .field .icon ::slotted(*)  {
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
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

export default FormElementComponent;
