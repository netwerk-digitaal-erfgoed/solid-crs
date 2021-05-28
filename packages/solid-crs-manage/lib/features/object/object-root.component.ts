import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, queryAll } from 'lit-element';
import { ArgumentError, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent, FormActors, FormSubmissionStates, FormEvents, Alert, LargeCardComponent, FormRootStates, FormCleanlinessStates, FormValidationStates } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ActorRef, Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Cross, Object as ObjectIcon, Save, Theme, Trash, Image, Identity, Connect } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
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
  @queryAll('nde-large-card')
  private formCards: LargeCardComponent[];
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
   * The object to be displayed and/or edited.
   */
  @internalProperty()
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
  canSubmit? = false;

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

      if(changed.has('formActor') && this.formActor){

        this.subscribe('isSubmitting', from(this.formActor).pipe(
          map((state) => state.matches(FormSubmissionStates.SUBMITTING)),
        ));

        this.subscribe('canSubmit', from(this.formActor).pipe(
          map((state) => state.matches({
            [FormSubmissionStates.NOT_SUBMITTED]:{
              [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
              [FormRootStates.VALIDATION]: FormValidationStates.VALID,
            },
          })),
        ));

      }

      this.subscribe('state', from(this.actor));

      this.subscribe('object', from(this.actor)
        .pipe(map((state) => state.context?.object)));

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
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const editing = this.state?.matches(ObjectStates.EDITING);

    const initializeFormMachine = () => { if (!editing) { this.actor.send(ObjectEvents.CLICKED_EDIT); } };

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const sidebarItems = [
      'nde.features.object.sidebar.image',
      'nde.features.object.sidebar.identification',
      'nde.features.object.sidebar.creation',
      'nde.features.object.sidebar.representation',
      'nde.features.object.sidebar.dimensions',
      'nde.features.object.sidebar.other',
    ];

    return this.object ? html`
    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
      <div slot="title"> ${this.object.name} </div>
      <div slot="subtitle"> ${this.object.description} </div>

      ${ editing ? html`<div slot="actions"><button class="no-padding inverse save" @click="${() => this.formActor.send(FormEvents.FORM_SUBMITTED)}" ?disabled="${this.isSubmitting}">${unsafeSVG(Save)}</button></div>` : '' }
      ${ editing ? html`<div slot="actions"><button class="no-padding inverse cancel" @click="${() => this.actor.send(ObjectEvents.CANCELLED_EDIT)}">${unsafeSVG(Cross)}</button></div>` : '' }
      <div slot="actions"><button class="no-padding inverse delete" @click="${() => this.actor.send(ObjectEvents.CLICKED_DELETE, { object: this.object })}">${unsafeSVG(Trash)}</button></div>
    </nde-content-header>
    <div class="content-and-sidebar">

      <nde-sidebar>
        <nde-sidebar-item .padding="${false}" .showBorder="${false}">
          <nde-sidebar-list slot="content">
            ${sidebarItems.map((item) => html`
            <nde-sidebar-list-item slot="item"
              ?selected="${ false }"
              @click="${() => { Array.from(this.formCards).find((card) => card.id === item).scrollIntoView({ behavior: 'smooth', block: 'center' }); }}"
            >
              <div slot="title">${this.translator?.translate(item)}</div>
            </nde-sidebar-list-item>
            `)}
          </nde-sidebar-list>
        </nde-sidebar-item>
      </nde-sidebar>

      <div class="content">

        ${ alerts }
        
        <nde-large-card id="nde.features.object.sidebar.image">
          <div slot="title">${this.translator?.translate('nde.features.object.card.image.title')}</div>
          <div slot="subtitle">${this.translator?.translate('nde.features.object.card.image.subtitle')}</div>
          <div slot="icon">
            ${unsafeSVG(Image)}
          </div>
          <img slot="image" src="${this.object.image}">
          <div slot="content">
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="image">
              <label slot="label" for="image">${this.translator?.translate('nde.features.object.card.image.field.file')}</label>
              <input type="text" slot="input" name="image" value="${this.object.image}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="license">
              <label slot="label" for="license">${this.translator?.translate('nde.features.object.card.image.field.license')}</label>
              <input type="text" slot="input" name="license" value="${this.object.license}" @click="${initializeFormMachine}"/>
            </nde-form-element>
          </div>
        </nde-large-card>

        <nde-large-card .showImage="${false}" id="nde.features.object.sidebar.identification">
          <div slot="title">${this.translator?.translate('nde.features.object.card.identification.title')}</div>
          <div slot="subtitle">${this.translator?.translate('nde.features.object.card.identification.subtitle')}</div>
          <div slot="icon">
            ${unsafeSVG(Identity)}
          </div>
          <div slot="content">
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="identifier">
              <label slot="label" for="identifier">${this.translator?.translate('nde.features.object.card.identification.field.object-number')}</label>
              <input type="text" slot="input" name="identifier" value="${this.object.identifier}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="type">
              <label slot="label" for="type">${this.translator?.translate('nde.features.object.card.identification.field.type')}</label>
              <input type="text" slot="input" name="type" value="${this.object.type}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="additionalType">
              <label slot="label" for="additionalType">${this.translator?.translate('nde.features.object.card.identification.field.object-name')}</label>
              <input type="text" slot="input" name="additionalType" value="${this.object.additionalType}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="name">
              <label slot="label" for="name">${this.translator?.translate('nde.features.object.card.identification.field.title')}</label>
              <input type="text" slot="input" name="name" value="${this.object.name}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="description">
              <label slot="label" for="description">${this.translator?.translate('nde.features.object.card.identification.field.description')}</label>
              <input type="text" slot="input" name="description" value="${this.object.description}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="collection">
              <label slot="label" for="collection">${this.translator?.translate('nde.features.object.card.identification.field.collection')}</label>
              <input type="text" slot="input" name="collection" value="${this.object.collection}" @click="${initializeFormMachine}"/>
            </nde-form-element>
          </div>
        </nde-large-card>

        <nde-large-card .showImage="${false}" id="nde.features.object.sidebar.creation">
          <div slot="title">${this.translator?.translate('nde.features.object.card.creation.title')}</div>
          <div slot="subtitle">${this.translator?.translate('nde.features.object.card.creation.subtitle')}</div>
          <div slot="icon">
            ${unsafeSVG(ObjectIcon)}
          </div>
          <div slot="content">
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="creator">
              <label slot="label" for="creator">${this.translator?.translate('nde.features.object.card.creation.field.creator')}</label>
              <input type="text" slot="input" name="creator" value="${this.object.creator}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="locationCreated">
              <label slot="label" for="locationCreated">${this.translator?.translate('nde.features.object.card.creation.field.location')}</label>
              <input type="text" slot="input" name="locationCreated" value="${this.object.locationCreated}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="material">
              <label slot="label" for="material">${this.translator?.translate('nde.features.object.card.creation.field.material')}</label>
              <input type="text" slot="input" name="material" value="${this.object.material}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="dateCreated">
              <label slot="label" for="dateCreated">${this.translator?.translate('nde.features.object.card.creation.field.date')}</label>
              <input type="text" slot="input" name="dateCreated" value="${this.object.dateCreated}" @click="${initializeFormMachine}"/>
            </nde-form-element>
          </div>
        </nde-large-card>

        <nde-large-card .showImage="${false}" id="nde.features.object.sidebar.representation">
          <div slot="title">${this.translator?.translate('nde.features.object.card.representation.title')}</div>
          <div slot="subtitle">${this.translator?.translate('nde.features.object.card.representation.subtitle')}</div>
          <div slot="icon">
            ${unsafeSVG(ObjectIcon)}
          </div>
          <div slot="content">
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="subject">
              <label slot="label" for="subject">${this.translator?.translate('nde.features.object.card.representation.field.subject')}</label>
              <input type="text" slot="input" name="subject" value="${this.object.subject}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="location">
              <label slot="label" for="location">${this.translator?.translate('nde.features.object.card.representation.field.location')}</label>
              <input type="text" slot="input" name="location" value="${this.object.location}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="person">
              <label slot="label" for="person">${this.translator?.translate('nde.features.object.card.representation.field.person')}</label>
              <input type="text" slot="input" name="person" value="${this.object.person}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="organization">
              <label slot="label" for="organization">${this.translator?.translate('nde.features.object.card.representation.field.organization')}</label>
              <input type="text" slot="input" name="organization" value="${this.object.organization}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="event">
              <label slot="label" for="event">${this.translator?.translate('nde.features.object.card.representation.field.event')}</label>
              <input type="text" slot="input" name="event" value="${this.object.event}" @click="${initializeFormMachine}"/>
            </nde-form-element>
          </div>
        </nde-large-card>

        <nde-large-card .showImage="${false}" id="nde.features.object.sidebar.dimensions">
          <div slot="title">${this.translator?.translate('nde.features.object.card.dimensions.title')}</div>
          <div slot="subtitle">${this.translator?.translate('nde.features.object.card.dimensions.subtitle')}</div>
          <div slot="icon">
            ${unsafeSVG(Connect)}
          </div>
          <div slot="content">
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="depth">
              <label slot="label" for="depth">${this.translator?.translate('nde.features.object.card.dimensions.field.depth')}</label>
              <input type="text" slot="input" name="depth" value="${this.object.depth}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="width">
              <label slot="label" for="width">${this.translator?.translate('nde.features.object.card.dimensions.field.width')}</label>
              <input type="text" slot="input" name="width" value="${this.object.width}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="height">
              <label slot="label" for="height">${this.translator?.translate('nde.features.object.card.dimensions.field.height')}</label>
              <input type="text" slot="input" name="height" value="${this.object.height}" @click="${initializeFormMachine}"/>
            </nde-form-element>
            <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="weight">
              <label slot="label" for="weight">${this.translator?.translate('nde.features.object.card.dimensions.field.weight')}</label>
              <input type="text" slot="input" name="weight" value="${this.object.weight}" @click="${initializeFormMachine}"/>
            </nde-form-element>
          </div>
        </nde-large-card>

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
        nde-large-card div[slot="content"] {
          display: flex;
          flex-direction: column;
          gap: var(--gap-normal);
        }
      `,
    ];

  }

}
