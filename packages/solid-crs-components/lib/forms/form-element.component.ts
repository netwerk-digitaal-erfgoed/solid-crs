import { css, CSSResult, html, internalProperty, property, PropertyValues, query, TemplateResult, unsafeCSS } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ArgumentError, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Loading, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { debounce } from 'debounce';
import { Interpreter } from 'xstate';
import { State } from '../state/state';
import { FormContext, FormRootStates, FormStates, FormSubmissionStates, FormValidationStates } from './form.machine';
import { FormValidatorResult } from './form-validator-result';
import { FormEvent, FormSubmittedEvent, FormUpdatedEvent } from './form.events';

/**
 * A component which shows the details of a single collection.
 */
export class FormElementComponent<T> extends RxLitElement {

  /**
   * All input elements slotted in the form element.
   */
  @internalProperty()
  inputs?: (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLUListElement)[];

  /**
   * The slot element which contains the input field.
   */
  @query('slot[name="input"]')
  inputSlot?: HTMLSlotElement;

  /**
   * The slot element which contains the input field.
   */
  @query('.field')
  fieldDiv?: HTMLDivElement;

  /**
   * The slot element which contains the icon.
   */
  @query('.icon')
  iconDiv?: HTMLDivElement;

  /**
   * Decides whether a border should be shown around the content
   */
  @internalProperty()
  inverse = false;

  /**
   * Decides whether the label should be shown
   */
  @property({ type: Boolean })
  showLabel = true;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  translator?: Translator;

  /**
   * The name of the data attribute edited by the form element.
   */
  @property({ type: String })
  field?: keyof T;

  /**
   * The element's form validation results.
   */
  @internalProperty()
  validationResults?: FormValidatorResult[];

  /**
   * Indicates if the element's loading icon should be shown.
   */
  @internalProperty()
  showLoading = false;

  /**
   * Indicates if the form should submit on keypress = enter.
   */
  @internalProperty()
  submitOnEnter = true;

  /**
   * Indicates if the form's input should be locked.
   */
  @internalProperty()
  lockInput = false;

  /**
   * Indicates whether the form is ready to be submitted
   */
  @internalProperty()
  isValid = false;

  /**
   * Timeout to use when debouncing input.
   */
  @property({ type: Number })
  debounceTimeout = 500;

  /**
   * The element's data.
   */
  @internalProperty()
  data?: T;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  actor?: Interpreter<FormContext<T>, State<FormStates, FormContext<unknown>>, FormEvent>;

  /**
   * Decides whether validation results should be shown below the form element
   * When false, only shows a yellow border
   */
  @property({ type: Boolean })
  hideValidation = false;

  /**
   * Hook called on every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    this.inverse = this.className?.includes('inverse');

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
      this.subscribe('isValid', from(this.actor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING) || state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.VALIDATION]: FormValidationStates.VALID,
          },
        })),
      ));

      // Subscribes to data in the actor's context.
      this.subscribe('lockInput', from(this.actor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING) || state.matches(FormSubmissionStates.SUBMITTED)),
      ));

      if (this.inputSlot && this.field && this.data) {

        this.bindActorToInput(this.inputSlot, this.actor, this.field, this.data);

      }

    }

    /**
     * Update the disabled state of the input elements.
     */
    if(changed.has('lockInput')) {

      this.inputs?.forEach((element) => {

        if (!(element instanceof HTMLUListElement)) element.disabled = this.lockInput;

      });

    }

  }

  /**
   * Binds default data and event listener for input form.
   */
  bindActorToInput(
    slot: HTMLSlotElement,
    actor: Interpreter<FormContext<T>, State<FormStates, FormContext<unknown>>, FormEvent>,
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
                    element instanceof HTMLTextAreaElement ||
                    element instanceof HTMLUListElement
    ).map((element) => element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLUListElement);

    this.inputs?.forEach((element) => {

      const fieldData = data[field];

      if (element instanceof HTMLSelectElement) {

        // Set the input field's default value.
        const input = element.namedItem(fieldData && (typeof fieldData === 'string' || typeof fieldData === 'number') ? fieldData.toString() : '');
        if (input) input.selected = true;

        // Send event when input field's value changes.
        element.addEventListener('input', () => actor.send(new FormUpdatedEvent(field.toString(), element.options[element.selectedIndex].id)));

      } else if ((element instanceof HTMLTextAreaElement) || (element instanceof HTMLInputElement)) {

        // Set the input field's default value.
        element.value = fieldData && (typeof fieldData === 'string' || typeof fieldData === 'number') ? fieldData.toString() : '';

        // Send event when input field's value changes.
        element.addEventListener(
          'input',
          debounce(() => {

            let formValue;
            const inputStringValue = element.value.trim();

            if (typeof fieldData === 'number') {

              const parsedNumberValue = inputStringValue.replace(',', '.');
              formValue = isNaN(+(parsedNumberValue)) ? NaN : parsedNumberValue;

            } else {

              formValue = inputStringValue;

            }

            actor.send(new FormUpdatedEvent(field.toString(), formValue.toString()));

          }, this.debounceTimeout),
        );

      } else if ((element as HTMLUListElement).type === 'multiselect' && Array.from(element.children).find((li) =>
        Array.from(li.children).find((input) =>
          input instanceof HTMLInputElement && input.type === 'checkbox'))
      ) {

        // the element is a <ul> containing <li>'s containing <input>s with type=checkboxes

        const titleListItem = element.children[0] as HTMLElement;

        const checkboxListItems = Array.from(element.children).slice(1) as HTMLLIElement[];
        checkboxListItems.forEach((li) => li.hidden = true);

        // A list of all the checkboxes
        const checkboxInputs = ([] as HTMLInputElement[]).concat(
          ...(checkboxListItems.map((li) => Array.from(li.children)) as HTMLInputElement[][])
        ).filter((node) => node instanceof HTMLInputElement);

        // Make the <ul> focusable, to be able to catch focusout events
        element.tabIndex = 0;

        // When the dropdown is closed
        // Make the padding on the ul clickable, not only the li
        element.classList.add('closed');

        if (Array.isArray(fieldData)) {

          // Set default (checked) values
          checkboxInputs.forEach((node) =>
            node.checked = fieldData.includes(node.id));

          titleListItem.textContent = fieldData.length > 0 ? `${fieldData.length} ${this.translator?.translate(fieldData.length > 1 ? 'term.n-sources-selected' : 'term.one-source-selected').toLowerCase()}` : this.translator?.translate('common.form.click-to-select') ?? '';

          titleListItem.parentElement?.addEventListener('click', () => {

            checkboxListItems.forEach((checkbox) => checkbox.hidden = false);
            titleListItem.hidden = true;
            checkboxInputs[0].focus();
            if (this.iconDiv) this.iconDiv.style.pointerEvents = 'initial';
            element.classList.remove('closed');

          });

          // When the user clicks outside of the list of elements, hide the list and update form machine
          element.parentElement?.addEventListener('focusout', (event) => {

            if (event.relatedTarget !== element
              && !checkboxInputs.map((el) => el.id).includes((event.relatedTarget as HTMLElement)?.id)) {

              checkboxListItems.forEach((checkbox) => checkbox.hidden = true);
              titleListItem.hidden = false;
              if (this.iconDiv) this.iconDiv.style.pointerEvents = 'none';
              element.classList.add('closed');

              const selectedValues = checkboxInputs.filter((input) => input.checked).map((input) => input.id);

              titleListItem.textContent = selectedValues?.length ?? -1 > 0
                ? `${selectedValues.length} ${this.translator?.translate(selectedValues.length > 1 ? 'term.n-sources-selected' : 'term.one-source-selected').toLowerCase()}`
                : this.translator?.translate('common.form.click-to-select') ?? '';

              actor.send(new FormUpdatedEvent(field.toString(), selectedValues));

            }

          });

        } else {

          // A multi select's fieldData should always be a list, since multiple values can be selected
          // This error will only be thrown when a programming mistake was made when setting up the form machine
          throw Error('Invalid field data (not a list)');

        }

      }

      // Listen for Enter presses to submit
      if (this.submitOnEnter) {

        element.addEventListener('keydown', (event) => {

          if ((event as KeyboardEvent).key === 'Enter' && this.validationResults && this.validationResults?.length < 1 && this.isValid) {

            event.preventDefault();

            actor.send(new FormSubmittedEvent());

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
      <div class="content${this.hideValidation && this.validationResults && this.validationResults?.length > 0  ? ' no-validation' : ''}${this.inverse ? ' no-border' : ''}">
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
      <div class="results" ?hidden="${this.hideValidation || this.validationResults?.length === 0}">
        ${this.validationResults?.map((result) => html`<div class="result">${this.translator?.translate(result.message)}</div>`)}
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
        .icon {
          pointer-events: none;
        }
        .loading, .loading svg {
          margin-right: var(--gap-normal);
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
          height: var(--gap-normal);
          width: var(--gap-normal);
        }
        .loading svg .loading-circle {
          stroke: var(--colors-primary-normal);
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
          background-color: var(--colors-background-light);
          height: 100%;
        }
        .form-element .content .field {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          flex: 1 0;
          border: var(--border-normal) solid var(--colors-foreground-normal);
          justify-content: flex-end;
          position: relative;
        }
        .form-element .content .field.no-border {
          border: none;
        }
        .form-element .content .field ::slotted(*) {
          padding: 0 var(--gap-normal);
          flex: 1 0;
          height: 100%;
          max-height: auto;
          font-size: var(--font-size-small);
          font-family: var(--font-family);
        }
        .form-element .content .field ::slotted(input),
        .form-element .content .field ::slotted(select), 
        .form-element .content .field ::slotted(textarea) {
          box-sizing: border-box;
        }
        .form-element .content .field ::slotted(textarea) {
          padding: var(--gap-normal);
          height: 128px;
        }
        .form-element .content .field .icon {
          margin: var(--gap-small) 0;
          height: 100%;
          display: flex;
          align-items: flex-start;
          z-index: 30;
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

        .help ::slotted(*) {
          margin-top: var(--gap-small);
        }
      `,
    ];

  }

}
