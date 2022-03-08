import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query, state } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormSubmissionStates, FormEvents, Alert, FormRootStates, FormCleanlinessStates, FormValidationStates, FormUpdatedEvent, formMachine, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ActorRef, interpret, Interpreter, InterpreterStatus, State, DoneInvokeEvent } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Cross, Object as ObjectIcon, Save, Theme, Trash, Open } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { ObjectImageryComponent, ObjectCreationComponent, ObjectIdentificationComponent, ObjectRepresentationComponent, ObjectDimensionsComponent } from '@netwerk-digitaal-erfgoed/solid-crs-semcom-components';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ComponentMetadata } from '@digita-ai/semcom-core';
import { define } from '@digita-ai/dgt-components';
import { DismissAlertEvent } from '../../app.events';
import { SemComService } from '../../common/semcom/semcom.service';
import { ObjectContext, ObjectStates, validateObjectForm } from './object.machine';
import { ClickedDeleteObjectEvent, ClickedObjectSidebarItem, ClickedObjectUpdatesOverview, ClickedResetEvent, ClickedSaveEvent, ClickedTermFieldEvent, SelectedTermsEvent } from './object.events';
import { TermActors } from './terms/term.machine';
import { TermEvent } from './terms/term.events';
import { ObjectUpdate } from './models/object-update.model';
import { ObjectUpdatesOverviewComponent } from './components/object-updates-overview.component';

/**
 * The root page of the object feature.
 */
export class ObjectRootComponent extends RxLitElement {

  /**
   * The form cards in this component
   */
  @internalProperty()
  formCards: (ObjectImageryComponent
  | ObjectCreationComponent
  | ObjectIdentificationComponent
  | ObjectRepresentationComponent
  | ObjectDimensionsComponent)[];
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
  @property({ type: Object })
  object?: CollectionObject;

  /**
   * The original object to be displayed and/or edited.
   */
  @property({ type: Object })
  original?: CollectionObject;

  /**
   * The form machine used by the form actor
   */
  @internalProperty()
  formMachine = formMachine<any>((context) => validateObjectForm(context));

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  formActor = interpret(this.formMachine, { devTools: true });

  /**
   * The actor responsible for editing term fields.
   */
  @internalProperty()
  termActor: ActorRef<TermEvent>;

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
   * Indicates whether the user is editing a field containing a Term.
   */
  @internalProperty()
  isEditingTermField? = false;

  /**
   * The semcom service to use in this component
   */
  @internalProperty()
  semComService? = new SemComService();

  /**
   * The content element to append SemComs to
   */
  @query('.content')
  contentElement: HTMLDivElement;

  /**
   * The ComponentMetadata of the SemComs
   */
  @internalProperty()
  components: ComponentMetadata[];

  /**
   * The popup component shown when the delete icon is clicked
   */
  @query('nde-popup#delete-popup')
  deletePopup: PopupComponent;

  /**
   * The image file to be uploaded
   */
  @internalProperty()
  imageFile?: File;

  @state() notifications?: ObjectUpdate[];

  /**
   * Hook called on first update after connection to the DOM.
   */
  async firstUpdated(changed: PropertyValues): Promise<void> {

    super.firstUpdated(changed);

    this.subscribe('notifications', from(this.actor).pipe(
      map((actorState) => actorState.context.notifications?.filter(
        (update) => update.originalObject === this.object?.uri
      )),
    ));

    this.subscribe('components', from(this.semComService.queryComponents({ latest: true })));

    this.addEventListener('CLICKED_TERM_FIELD', (event: CustomEvent<ClickedTermFieldEvent>) => {

      this.actor?.send(new ClickedTermFieldEvent(event.detail.field, event.detail.terms));
      event.stopPropagation();

    });

  }

  /**
   * Hook called on at every update after connection to the DOM.
   */
  async updated(changed: PropertyValues): Promise<void> {

    super.updated(changed);

    if(changed && changed.has('actor') && this.actor){

      this.actor.onEvent(async(event) => {

        if (event instanceof ClickedObjectSidebarItem) {

          const formCard = Array.from(this.formCards).find((card) => card.id === event.itemId);
          formCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        }

        if (event instanceof SelectedTermsEvent) {

          this.formActor.send(new FormUpdatedEvent(event.field, event.terms.map((term) => term.uri)));
          await this.createComponents(this.components);

          for (const card of Array.from(this.formCards)) {

            await card.updateComplete;
            const largeCard = card.shadowRoot.querySelector('nde-large-card');
            const scrollTo = largeCard.querySelector(`[field="${event.field}"]`);

            if (scrollTo) {

              scrollTo.scrollIntoView({ block: 'center' });
              break;

            }

          }

        }

        if(event instanceof ClickedResetEvent){

          this.initFormMachine(this.original, this.original, true);
          this.createComponents(this.components);

        }

        if (event.type === `done.invoke.ObjectMachine.${ObjectStates.SAVING}:invocation[0]`) {

          const parsed = event as DoneInvokeEvent<CollectionObject>;
          this.initFormMachine(parsed.data, parsed.data, true);
          this.createComponents(this.components);

        }

      });

      if(this.actor.parent){

        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((actorState) => actorState.context?.alerts)));

      }

      this.subscribe('termActor', from(this.actor).pipe(
        map((actorState) => actorState.children[TermActors.TERM_MACHINE]),
      ));

      this.subscribe('state', from(this.actor));

      this.subscribe('collections', from(this.actor).pipe(
        map((actorState) => actorState.context.collections),
      ));

      this.subscribe('original', from(this.actor).pipe(
        map((actorState) => actorState.context.original),
      ));

      this.subscribe('object', from(this.actor).pipe(
        map((actorState) => {

          if (actorState.context?.object && actorState.context?.original) {

            this.formCards?.forEach((card) => card.object = actorState.context.object);

            this.initFormMachine(actorState.context.object, actorState.context.original);

            return actorState.context?.object;

          }

          return undefined;

        })
      ));

      this.subscribe('isEditingTermField', from(this.actor)
        .pipe(map((actorState) => actorState.matches(ObjectStates.EDITING_FIELD))));

    }

    if (!this.formCards && this.components && this.object && this.formActor && this.translator) {

      await this.registerComponents(this.components);
      await this.createComponents(this.components);

    }

  }

  initFormMachine(object: CollectionObject, original: CollectionObject, restart = false): void {

    // when the object is loaded, prepare and start up the form machine (once)
    if (restart || this.formActor.status !== InterpreterStatus.Running) {

      // replace Terms with lists of uri
      // form machine can only handle (lists of) strings, not objects (Terms)
      const parseObject = (obj: CollectionObject) => ({
        ...obj,
        additionalType: obj?.additionalType
          ? obj.additionalType.map((term) => term.uri) : undefined,
        creator: obj?.creator ? obj.creator.map((term) => term.uri) : undefined,
        locationCreated: obj?.locationCreated
          ? obj.locationCreated.map((term) => term.uri) : undefined,
        material: obj?.material ? obj.material.map((term) => term.uri) : undefined,
        subject: obj?.subject ? obj.subject.map((term) => term.uri) : undefined,
        location: obj?.location ? obj.location.map((term) => term.uri) : undefined,
        person: obj?.person ? obj.person.map((term) => term.uri) : undefined,
        organization: obj?.organization ? obj.organization.map((term) => term.uri) : undefined,
        event: obj?.event ? obj.event.map((term) => term.uri) : undefined,
      });

      this.formMachine = this.formMachine.withContext({
        data: { ... parseObject(object) },
        original: { ... parseObject(original) },
      });

      this.formActor = interpret(this.formMachine, { devTools: true });

      this.formActor.onDone((event) => {

        this.actor.send(new ClickedSaveEvent({
          ...event.data.data,
          // don't use form values for Terms
          // as form machine will only return URIs for these fields, not full Terms
          // See above: this.formMachine's initial data
          additionalType: this.object?.additionalType,
          creator: this.object?.creator,
          locationCreated: this.object?.locationCreated,
          material: this.object?.material,
          subject: this.object?.subject,
          location: this.object?.location,
          person: this.object?.person,
          organization: this.object?.organization,
          event: this.object?.event,
          // set the image file as it is not included in form machine's data
          imageFile: this.object.imageFile,
        }));

      });

      this.subscribe('isSubmitting', from(this.formActor).pipe(
        map((actor) => actor.matches(FormSubmissionStates.SUBMITTING)),
      ));

      this.subscribe('isValid', from(this.formActor).pipe(
        map((actor) => !actor.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.VALIDATION]: FormValidationStates.INVALID,
          },
        })),
      ));

      this.subscribe('isDirty', from(this.formActor).pipe(
        map((actor) => actor.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
          },
        })),
      ));

      this.formActor.start();

      // this validates the form when form machine is started
      // needed for validation when coming back from the term machine
      // otherwise, form machine state is not_validated and the user can't save
      this.formActor.send(new FormUpdatedEvent('name', object.name));

    }

  }

  /**
   * Prepares for a new image upload when an image is selected
   *
   * @param event The custom image-selected event containing the image file.
   */
  private onImageSelected(event: CustomEvent<File>): void {

    this.object.imageFile = event.detail;

    this.formActor.send(new FormUpdatedEvent(
      'image',
      // use the object's uri to determine object storage directory
      // this value will only be used temporarily until the object is saved
      // after which it is set to a value chosen by the pod server
      `${new URL(this.object.uri).origin}${new URL(this.object.uri).pathname.split('/').slice(0, -1).join('/')}/${this.object.imageFile.name}`
    ));

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
   * Registers and adds all components to DOM
   *
   * @param components The component metadata to register and add
   */
  async registerComponents(components: ComponentMetadata[]): Promise<void> {

    for (const component of components) {

      if (!customElements.get(component.tag)) {

        // eslint-disable-next-line no-eval
        const elementComponent = await eval(`import("${component.uri}")`);

        const ctor = customElements.get(component.tag)
          || customElements.define(component.tag, elementComponent.default);

      }

    }

  }

  /**
   * Appends the formCards to the page content and removes previous children
   */
  async createComponents(components: ComponentMetadata[]): Promise<void> {

    this.formCards = undefined;

    for (const component of components) {

      let element;

      if (component.tag.includes('imagery')) {

        element = document.createElement(component.tag) as ObjectImageryComponent;
        element.id = 'object.sidebar.image';
        element.addEventListener('image-selected', this.onImageSelected);

      } else if (component.tag.includes('creation')) {

        element = document.createElement(component.tag) as ObjectCreationComponent;
        element.id = 'object.sidebar.creation';

      } else if (component.tag.includes('identification')) {

        element = document.createElement(component.tag) as ObjectIdentificationComponent;
        element.collections = this.collections;
        element.id = 'object.sidebar.identification';

      } else if (component.tag.includes('representation')) {

        element = document.createElement(component.tag) as ObjectRepresentationComponent;
        element.id = 'object.sidebar.representation';

      } else if (component.tag.includes('dimensions')) {

        element = document.createElement(component.tag) as ObjectDimensionsComponent;
        element.id = 'object.sidebar.dimensions';

      }

      if (window.navigator.userAgent.includes('Macintosh') && window.navigator.userAgent.includes('Chrome/')) {

        element.addEventListener('contextmenu', (event: MouseEvent) => {

          event.stopPropagation();
          event.preventDefault();

        });

      }

      element.object = this.object;
      element.formActor = this.formActor as any;
      element.translator = this.translator;
      element.logger = this.logger;

      this.formCards = this.formCards?.includes(element)
        ? this.formCards : [ ...this.formCards ? this.formCards : [], element ];

    }

    this.updateSelected();

  }

  /**
   * Sets this.selected to the currently visible form card's id
   */
  updateSelected(): void {

    this.visibleCard = Array.from(this.formCards).find((formCard) => {

      const box = formCard.getBoundingClientRect();

      return box.top >= -(box.height / (3 + 20));

    })?.id;

  }

  onUpdatesOverviewClicked = (): void => {

    this.actor.send(new ClickedObjectUpdatesOverview());

  };

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const toggleDelete =  () => { this.deletePopup.toggle(); };

    const idle = this.state?.matches(ObjectStates.IDLE);

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const sidebarItems = this.formCards?.map((formCard) => formCard.id);

    const showLoading = !(
      this.state?.matches(ObjectStates.IDLE) ||
      this.state?.matches(ObjectStates.EDITING_FIELD) ||
      this.state?.matches(ObjectStates.OBJECT_UPDATES_OVERVIEW)
    );

    return this.object ? html`

      ${ showLoading || !this.formCards ? html`<nde-progress-bar></nde-progress-bar>` : html``}

      <nde-content-header inverse>
        <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>

        <nde-form-element slot="title" class="title inverse" .showLabel="${false}" hideValidation debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="name">
          <input type="text" slot="input"  class="name" value="${this.object.name}" ?disabled="${this.isSubmitting}"/>
        </nde-form-element>
        <nde-form-element slot="subtitle" class="subtitle inverse" .showLabel="${false}" hideValidation debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="description">
          <input type="text" slot="input" class="description" value="${this.object.description}" ?disabled="${this.isSubmitting}" placeholder="${this.translator.translate('common.form.description-placeholder')}"/>
        </nde-form-element>

        ${ !this.state?.matches(ObjectStates.OBJECT_UPDATES_OVERVIEW) ? html`
          ${ idle && this.isDirty && this.isValid ? html`<div slot="actions"><button class="no-padding inverse save" @click="${() => { if(this.isDirty && this.isValid) { this.formActor.send(FormEvents.FORM_SUBMITTED); } }}">${unsafeSVG(Save)}</button></div>` : '' }
          ${ idle && this.isDirty ? html`<div slot="actions"><button class="no-padding inverse reset" @click="${() => { if(this.isDirty) { this.actor.send(new ClickedResetEvent()); } }}">${unsafeSVG(Cross)}</button></div>` : '' }
          <div slot="actions"><a href="${process.env.VITE_PRESENTATION_URI}${encodeURIComponent(this.state?.context.webId)}/object/${encodeURIComponent(this.object.uri)}" target="_blank" rel="noopener noreferrer">${unsafeSVG(Open)}</a></div>
          <div slot="actions"><button class="no-padding inverse delete" @click="${() => toggleDelete()}">${unsafeSVG(Trash)}</button></div>
        ` : ''}
      </nde-content-header>

      <div class="content-and-sidebar">
        ${ this.formCards ? html`
          <nde-sidebar>
            ${ this.notifications?.length > 0 ? html`
              <nde-sidebar-item .padding="${false}">
                <nde-sidebar-list slot="content">
                  <nde-sidebar-list-item slot="item"
                    @click="${this.onUpdatesOverviewClicked}"
                    ?selected="${ this.state?.matches(ObjectStates.OBJECT_UPDATES_OVERVIEW)}"
                  >
                    <div slot="title">${this.translator?.translate('object.sidebar.updates')} (${this.notifications.length})</div>
                  </nde-sidebar-list-item>
                </nde-sidebar-list>
              </nde-sidebar-item>
            ` : ''}
            <nde-sidebar-item .padding="${false}" .showBorder="${false}">
              <nde-sidebar-list slot="content">
                <nde-sidebar-list-item slot="title" isTitle>
                  <div slot="title">${this.translator?.translate('object.sidebar.components')}</div>
                </nde-sidebar-list-item>
                ${sidebarItems?.map((item) => html`
                <nde-sidebar-list-item slot="item"
                ?selected="${ item === this.visibleCard }"
                @click="${() => this.actor.send(new ClickedObjectSidebarItem(item))}">
                  <div slot="title">${this.translator?.translate(item)}</div>
                </nde-sidebar-list-item>
                `)}
              </nde-sidebar-list>
            </nde-sidebar-item>
          </nde-sidebar>

          ${ this.isEditingTermField ? html`
            <nde-term-search .logger='${this.logger}' .actor="${this.termActor}" .translator="${this.translator}" .object="${this.object}"></nde-term-search>
          ` : this.formCards ? html`
            <div class="content" @scroll="${ () => window.requestAnimationFrame(() => { this.updateSelected(); })}">
              ${ alerts }
              ${ !this.state?.matches(ObjectStates.OBJECT_UPDATES_OVERVIEW) ? html`
                ${ this.formCards }
              ` : html`
                <object-updates-overview
                  .notifications="${this.notifications}"
                  .actor="${this.actor}"
                  .translator="${this.translator}"
                ></object-updates-overview>
              `}
            </div>
          ` : html`no formcards`}
        ` : html``}
        <nde-popup dark id="delete-popup">
          <div slot="content">
            <p>${this.translator?.translate('object.root.delete.title')}</p>
            <div>
              <button class='primary confirm-delete' @click="${() => { this.actor.send(new ClickedDeleteObjectEvent(this.object)); toggleDelete(); }}">
                  <span>${this.translator?.translate('object.root.delete.confirm')}</span>
              </button>
              <button class='light cancel-delete' @click="${() => toggleDelete()}">
                  <span>${this.translator?.translate('object.root.delete.cancel')}</span>
              </button>
            </div>
          </div>
        </nde-popup>
      </div>`
      : html``;

  }

  constructor() {

    super();
    define('object-updates-overview', ObjectUpdatesOverviewComponent);

    if(!customElements.get('nde-popup')) {

      customElements.define('nde-popup', PopupComponent);

    }

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
          height: 1px;
          flex: 1 1;
        }
        .content {
          padding: var(--gap-large);
          width: 100%;
          overflow-y: auto;
          overflow-x: clip;
          display: flex;
          flex-direction: column;
          display:flex; 
          flex-direction: column;
        }
        .content > *:not(:last-child) {
          margin-bottom: var(--gap-large);
        }
        nde-progress-bar {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
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
        button svg {
          max-width: var(--gap-normal);
          height: var(--gap-normal);
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
          margin: var(--gap-large) var(--gap-tiny) 0;
        }
        button.accent {
          color: var(--colors-foreground-inverse);
        }
        button.light {
          color:var(--colors-primary-dark);
        }
        div[slot="actions"] a svg {
          width: 20px;
          height: 20px;
          fill: var(--colors-primary-light);
          stroke: var(--colors-primary-light);
        }
      `,
    ];

  }

}
