import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent, FormActors, FormSubmissionStates, FormEvents, Alert, FormRootStates, FormValidationStates, FormCleanlinessStates, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ActorRef, Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Collection as CollectionIcon, Cross, Empty, Object as ObjectIcon, Plus, Save, Theme, Trash } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AppEvents, DismissAlertEvent } from '../../app.events';
import { ObjectEvents } from '../object/object.events';
import { CollectionContext, CollectionStates } from './collection.machine';
import { CollectionEvents } from './collection.events';

/**
 * The root page of the collection feature.
 */
export class CollectionRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<CollectionContext>;

  /**
   * The component's alerts.
   */
  @property({ type: Array })
  public alerts: Alert[];

  /**
   * Check if there should be a delete icon.
   */
  @property({ type: Boolean })
  public showDelete: boolean;

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<CollectionContext>;

  /**
   * The collections which will be summarized by the component.
   */
  @property({ type: Object })
  collection?: Collection;

  /**
   * The list of objects in the current collection.
   */
  @internalProperty()
  objects?: CollectionObject[];

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  formActor: ActorRef<FormEvent>;

  /**
   * Indicates if the form is being submitted.
   */
  @internalProperty()
  isSubmitting? = false;

  /**
   * Indicates if if the form validation passed.
   */
  @internalProperty()
  isValid? = false;

  /**
   * Indicates if one the form fields has changed.
   */
  @internalProperty()
  isDirty? = false;

  /**
   * The popup component shown when the delete icon is clicked
   */
  @query('nde-popup#delete-popup')
  deletePopup: PopupComponent;

  /**
   * Hook called on at every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed && changed.has('actor') && this.actor){

      if(this.actor.parent){

        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((state) => state.context?.alerts)));

      }

      this.subscribe('formActor', from(this.actor).pipe(
        map((state) => state.children[FormActors.FORM_MACHINE]),
      ));

      this.subscribe('state', from(this.actor));

      this.subscribe('collection', from(this.actor)
        .pipe(map((state) => state.context?.collection)));

      this.subscribe('objects', from(this.actor)
        .pipe(map((state) => state.context?.objects)));

    }

    if(changed?.has('formActor') && this.formActor){

      this.subscribe('isSubmitting', from(this.formActor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING)),
      ));

      this.subscribe('isValid', from(this.formActor).pipe(
        map((state) => state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.VALIDATION]: FormValidationStates.VALID,
          },
        })),
      ));

      this.subscribe('isDirty', from(this.formActor).pipe(
        map((state) => state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
          },
        })),
      ));

    }

  }

  /**
   * Handles a dismiss event by sending a dismiss alert event to its parent.
   *
   * @param event Dismiss event dispatched by an alert componet.
   */
  handleDismiss(event: CustomEvent<Alert>): void {

    if (!event || !event.detail) {

      throw new ArgumentError('Argument event || event.detail should be set.', event);

    }

    if (!this.actor || !this.actor.parent) {

      throw new ArgumentError('Argument this.actor || !this.actor.parent should be set.', this.actor);

    }

    this.actor.parent.send(new DismissAlertEvent(event.detail));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const toggleDelete =  () => { this.deletePopup.toggle(); };

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const showLoading = !(this.state?.matches(CollectionStates.IDLE)
      || this.state?.matches(CollectionStates.EDITING));

    return !!this.actor && !!this.collection ? html`
    
    ${ showLoading ? html`<nde-progress-bar></nde-progress-bar>` : html``}

    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(CollectionIcon) }</div>
      ${this.actor.state.matches(CollectionStates.EDITING)
    ? html`
          <nde-form-element slot="title" class="title inverse" .showLabel="${false}" .showValidation="${false}" debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="name">
            <input autofocus type="text" slot="input"  class="name" value="${this.collection.name}" ?disabled="${this.isSubmitting}"/>
          </nde-form-element>
          <nde-form-element slot="subtitle" class="subtitle inverse"  .showLabel="${false}" .showValidation="${false}" debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="description">
            <input type="text" slot="input" class="description" value="${this.collection.description}" ?disabled="${this.isSubmitting}" placeholder="${this.translator.translate('nde.common.form.description-placeholder')}"/>
          </nde-form-element>
        `
    : html`
          <div slot="title" class="title" @click="${() => this.actor.send(CollectionEvents.CLICKED_EDIT)}">
            ${this.collection.name}
          </div>
          <div slot="subtitle" class="subtitle" @click="${() => this.actor.send(CollectionEvents.CLICKED_EDIT)}">
            ${ this.collection.description && this.collection.description.length > 0 ? this.collection.description : this.translator.translate('nde.common.form.description-placeholder') }
          </div>
        `
}
      ${ this.isDirty && this.isValid ? html`<div slot="actions"><button class="no-padding inverse save" @click="${() => this.formActor.send(FormEvents.FORM_SUBMITTED)}" ?disabled="${this.isSubmitting}">${unsafeSVG(Save)}</button></div>` : '' }
      ${ this.state?.matches(CollectionStates.EDITING) ? html`<div slot="actions"><button class="no-padding inverse cancel" @click="${() => this.actor.send(CollectionEvents.CANCELLED_EDIT)}">${unsafeSVG(Cross)}</button></div>` : '' }
      <div slot="actions"><button class="no-padding inverse create" @click="${() => this.actor.send(CollectionEvents.CLICKED_CREATE_OBJECT)}">${unsafeSVG(Plus)}</button></div>
      ${this.showDelete ? html`<div slot="actions"><button class="no-padding inverse delete" @click="${() => toggleDelete()}">${unsafeSVG(Trash)}</button></div>` : '' }
    </nde-content-header>

    <div class="content">
      ${ alerts }
      
      ${this.state?.matches(CollectionStates.LOADING)
    ? html``
    : html`
                ${this.objects?.length
    ? html`
          <div class='three-column-content-grid'>
            ${this.objects.map((object) => html`<nde-object-card @click="${() => this.actor.send(ObjectEvents.SELECTED_OBJECT, { object })}" .translator=${this.translator} .object=${object}></nde-object-card>`)}
          </div>
        `
    : html`
          <div class="empty-container">
            <div class='empty'>
              ${unsafeSVG(Empty)}
              <div class='text'>${this.translator?.translate('nde.features.collections.root.empty.create-object-title')}</div>
              <button class='accent' @click="${() => this.actor.send(CollectionEvents.CLICKED_CREATE_OBJECT)}">
                ${unsafeSVG(ObjectIcon)}
                <span>${this.translator?.translate('nde.features.collections.root.empty.create-object-button')}</span>
              </button>
            </div>
          </div>
        `
}
        `
}
      <nde-popup dark id="delete-popup">
        <div slot="content">
          <p>${this.translator?.translate('nde.features.collections.root.delete.title')}</p>
          <div>
            <button class='primary confirm-delete' @click="${() => { this.actor.send(CollectionEvents.CLICKED_DELETE); toggleDelete(); }}">
                <span>${this.translator?.translate('nde.features.collections.root.delete.confirm')}</span>
            </button>
            <button class='light cancel-delete' @click="${() => toggleDelete()}">
                <span>${this.translator?.translate('nde.features.collections.root.delete.cancel')}</span>
            </button>
          </div>
        </div>
      </nde-popup>
    </div>
  ` : html``;

  }

  constructor() {

    super();

    if(!customElements.get('nde-popup')) {

      customElements.define('nde-popup', PopupComponent);

    }

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        *::-webkit-scrollbar-thumb {
          background-color: var(--colors-foreground-light);
          border: 3px solid var(--colors-background-normal);
        }
        *::-webkit-scrollbar-track {
          background: var(--colors-background-normal);
        }
        :host {
          scrollbar-color: var(--colors-foreground-light) var(--colors-background-normal);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .content {
          margin-top: 1px;
          padding: var(--gap-large);
          height: 100%;
          overflow-y: auto;
          display:flex; 
          flex-direction: column;
        }
        nde-progress-bar {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
        }
        nde-object-card, nde-collection-card {
          height: 227px;
        }
        button svg {
          max-width: var(--gap-normal);
          height: var(--gap-normal);
        }
        nde-form-element input {
          padding: 0;
          line-height: var(--gap-normal);
        }
        nde-content-header div[slot="title"]:hover, nde-content-header div[slot="subtitle"]:hover {
          cursor: pointer;
        }
        .name {
          font-weight: bold;
          font-size: var(--font-size-large);
        }
        .description {
          margin-top: var(--gap-tiny);
        }
        .empty-container {
          display: flex;
          justify-content: center;
          flex-direction: column;
          height: 100%;
        }
        .empty {
          width: 100%;
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: var(--gap-large);
        }
        .empty .text {
          color: var(--colors-foreground-dark);
        }
        .empty > svg {
          width: 40%;
          height: auto;
        }
        .empty button {
          width: 260px;
          text-transform: none;
          padding: var(--gap-small) var(--gap-normal);
          display: flex;
          gap: var(--gap-normal);
          justify-content: flex-start;
          align-items: center;
        }
        .empty button span {
          display: inline-flex;
          align-items: center;
          height: var(--gap-normal);
        }
        .description {
          margin-top: var(--gap-tiny);
        }
        #delete-popup div[slot="content"] {
          background-color: var(--colors-foreground-inverse);
          align-items: center;
          padding: var(--gap-large);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        #delete-popup div[slot="content"] div button{
          width: 233px;
          height: 45px;
          margin: var(--gap-large) var(--gap-tiny) 0;
        }
        button.accent {
          color: var(--colors-foreground-inverse);
        }
        button.light {
          color:var(--colors-primary-dark);
        }
      `,
    ];

  }

}
