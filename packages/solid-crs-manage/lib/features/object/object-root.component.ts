import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, queryAll } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent, FormActors, FormSubmissionStates, FormEvents, Alert, FormRootStates, FormCleanlinessStates, FormValidationStates } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ActorRef, Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Cross, Object as ObjectIcon, Save, Theme, Trash } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AppEvents } from '../../app.events';
import { ObjectContext, ObjectStates } from './object.machine';
import { ObjectEvents } from './object.events';

/**
 * The root page of the object feature.
 */
export class ObjectRootComponent extends RxLitElement {

  /**
   * The form cards in this component
   */
  @queryAll('.form-card')
  formCards: RxLitElement[];
  /**
   * The id of the currently visible form card
   */
  @internalProperty()
  visibleCard: string;
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
  public actor: Interpreter<ObjectContext>;

  /**
   * The component's alerts.
   */
  @property({ type: Array })
  public alerts: Alert[];

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<ObjectContext>;

  /**
   * A list of all collections.
   */
  @internalProperty()
  collections?: Collection[];

  /**
   * The object to be displayed and/or edited.
   */
  @property()
  object?: CollectionObject;

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
   * Indicates if the form can be submitted.
   */
  @internalProperty()
  isValid? = false;

  /**
   * Indicates if the form can be submitted.
   */
  @internalProperty()
  isDirty? = false;

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

      this.subscribe('collections', from(this.actor).pipe(
        map((state) => state.context.collections),
      ));

      this.subscribe('object', from(this.actor)
        .pipe(map((state) => state.context?.object)));

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

    if (this.formCards?.length > 0 && !this.visibleCard) {

      this.visibleCard = this.formCards[0].id;

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

    this.actor.parent.send(AppEvents.DISMISS_ALERT, { alert: event.detail });

  }

  /**
   * Sets this.selected to the currently visible form card's id
   */
  updateSelected = (): void => {

    this.visibleCard = Array.from(this.formCards).find((formCard) => {

      const box = formCard.getBoundingClientRect();

      return box.top > -(box.height / 3);

    })?.id;

  };

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const editing = this.state?.matches(ObjectStates.IDLE);

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const sidebarItems = [
      'nde.features.object.sidebar.image',
      'nde.features.object.sidebar.identification',
      'nde.features.object.sidebar.creation',
      'nde.features.object.sidebar.representation',
      'nde.features.object.sidebar.dimensions',
    ];

    return this.object ? html`
    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
      <div slot="title"> ${this.object.name} </div>
      <div slot="subtitle"> ${this.object.description} </div>

      ${ editing && this.isValid && this.isDirty ? html`<div slot="actions"><button class="no-padding inverse save" @click="${() => { if(this.isValid && this.isDirty) { this.formActor.send(FormEvents.FORM_SUBMITTED); } }}">${unsafeSVG(Save)}</button></div>` : '' }
      ${ editing && this.isDirty ? html`<div slot="actions"><button class="no-padding inverse reset" @click="${() => { if(this.isDirty) { this.actor.send(ObjectEvents.CLICKED_RESET); } }}">${unsafeSVG(Cross)}</button></div>` : '' }
      <div slot="actions"><button class="no-padding inverse delete" @click="${() => this.actor.send(ObjectEvents.CLICKED_DELETE, { object: this.object })}">${unsafeSVG(Trash)}</button></div>
    </nde-content-header>
    <div class="content-and-sidebar">

      <nde-sidebar>
        <nde-sidebar-item .padding="${false}" .showBorder="${false}">
          <nde-sidebar-list slot="content">
            ${sidebarItems.map((item) => html`
            <nde-sidebar-list-item slot="item"
              ?selected="${ item === this.visibleCard }"
              @click="${() => { Array.from(this.formCards).find((card) => card.id === item).scrollIntoView({ behavior: 'smooth', block: 'center' }); }}"
            >
              <div slot="title">${this.translator?.translate(item)}</div>
            </nde-sidebar-list-item>
            `)}
          </nde-sidebar-list>
        </nde-sidebar-item>
      </nde-sidebar>

      <div class="content" @scroll="${ () => window.requestAnimationFrame(() => { this.updateSelected(); })}">

        ${ alerts }

        <nde-object-imagery
          id="nde.features.object.sidebar.image"
          class="form-card"
          .object="${this.object}"
          .formActor="${this.formActor}"
          .actor="${this.actor}"
          .translator="${this.translator}"
          .logger="${this.logger}">
        </nde-object-imagery>

        <nde-object-identification
          id="nde.features.object.sidebar.identification"
          class="form-card"
          .object="${this.object}"
          .collections="${this.collections}"
          .formActor="${this.formActor}"
          .actor="${this.actor}"
          .translator="${this.translator}"
          .logger="${this.logger}">
        </nde-object-identification>

        <nde-object-creation
          id="nde.features.object.sidebar.creation"
          class="form-card"
          .object="${this.object}"
          .formActor="${this.formActor}"
          .actor="${this.actor}"
          .translator="${this.translator}"
          .logger="${this.logger}">
        </nde-object-creation>

        <nde-object-representation
          id="nde.features.object.sidebar.representation"
          class="form-card"
          .object="${this.object}"
          .formActor="${this.formActor}"
          .actor="${this.actor}"
          .translator="${this.translator}"
          .logger="${this.logger}">
        </nde-object-representation>

        <nde-object-dimensions
          id="nde.features.object.sidebar.dimensions"
          class="form-card"
          .object="${this.object}"
          .formActor="${this.formActor}"
          .actor="${this.actor}"
          .translator="${this.translator}"
          .logger="${this.logger}">
        </nde-object-dimensions>

      </div>
    
    </div>
  ` : html` this.object is undefined, dit zou niet mogen voorvallen`;

  }

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
        .content-and-sidebar {
          margin-top: 1px;
          display: flex;
          flex-direction: row;
          overflow: hidden;
          height: 100%;
          flex: 1 1;
        }
        .content {
          padding: var(--gap-large);
          width: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--gap-large);
        }
        nde-content-header nde-form-element input {
          height: var(--gap-normal);
          padding: 0;
          line-height: var(--gap-normal);
        }
        .name {
          font-weight: bold;
          font-size: var(--font-size-large);
        }
        .description {
          margin-top: var(--gap-tiny);
        }
        nde-sidebar-list > slot[name="title"] {
          font-weight: bold;
        }
      `,
    ];

  }

}
