import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent, FormActors, FormSubmissionStates, FormEvents, Alert, FormRootStates, FormCleanlinessStates, FormValidationStates, FormUpdatedEvent, formMachine } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ActorRef, interpret, Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Cross, Object as ObjectIcon, Save, Theme, Trash } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { ObjectImageryComponent, ObjectCreationComponent, ObjectIdentificationComponent, ObjectRepresentationComponent, ObjectDimensionsComponent } from '@netwerk-digitaal-erfgoed/solid-crs-semcom-components';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ComponentMetadata } from '@digita-ai/semcom-core';
import { DismissAlertEvent } from '../../app.events';
import { SemComService } from '../../common/semcom/semcom.service';
import { ObjectContext, ObjectStates, validateObjectForm } from './object.machine';
import { ClickedDeleteObjectEvent, ClickedObjectSidebarItem, ClickedResetEvent, ClickedTermFieldEvent } from './object.events';
import { TermActors } from './terms/term.machine';
import { TermEvent } from './terms/term.events';

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
   * The form machine used by the form actor
   */
  formMachine = formMachine<CollectionObject>((context) => validateObjectForm(context));

  /**
   * The actor responsible for form validation in this component.
   */
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
   * Hook called on first update after connection to the DOM.
   */
  async firstUpdated(changed: PropertyValues): Promise<void> {

    super.firstUpdated(changed);

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

          this.requestUpdate();
          await this.updateComplete;

          const formCard = Array.from(this.formCards).find((card) => card.id === event.itemId);
          formCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        }

        if (event.type === `done.invoke.${TermActors.TERM_MACHINE}`) {

          this.requestUpdate();
          await this.updateComplete;

          this.updateSelected();

        }

      });

      if(this.actor.parent){

        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((state) => state.context?.alerts)));

      }

      // this.subscribe('formActor', from(this.actor).pipe(
      //   map((state) => {

      //     this.formCards?.forEach((card) => card.formActor = state.children[FormActors.FORM_MACHINE] as any);

      //     return state.children[FormActors.FORM_MACHINE];

      //   })
      // ));

      this.subscribe('termActor', from(this.actor).pipe(
        map((state) => state.children[TermActors.TERM_MACHINE]),
      ));

      this.subscribe('state', from(this.actor));

      this.subscribe('collections', from(this.actor).pipe(
        map((state) => state.context.collections),
      ));

      this.subscribe('object', from(this.actor).pipe(
        map((state) => {

          this.formCards?.forEach((card) => card.object = state.context?.object);

          this.formMachine = this.formMachine.withContext({
            data: state.context?.object,
            original: state.context?.object,
          });

          this.formActor = interpret(this.formMachine, { devTools: true });

          this.formActor.start();

          return state.context?.object;

        })
      ));

      this.subscribe('isEditingTermField', from(this.actor)
        .pipe(map((state) => state.matches(ObjectStates.EDITING_FIELD))));

    }

    if(changed?.has('formActor') && this.formActor){

      // this validates the form when form machine is started
      // needed for validation when coming back from the term machine
      // otherwise, form machine state is not_validated and the user can't save
      this.formActor.send(new FormUpdatedEvent('name', this.object?.name));

      this.subscribe('isSubmitting', from(this.formActor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING)),
      ));

      this.subscribe('isValid', from(this.formActor).pipe(
        map((state) => !state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.VALIDATION]: FormValidationStates.INVALID,
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

    if (!this.formCards && this.components && this.object && this.formActor && this.translator) {

      await this.registerComponents(this.components);

    }

    if (this.formCards && !this.isEditingTermField && this.components?.length < 1) {

      this.appendComponents(this.formCards);

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

      let element;

      if (component.tag.includes('imagery')) {

        element = document.createElement(component.tag) as ObjectImageryComponent;
        element.id = 'nde.features.object.sidebar.image';

      } else if (component.tag.includes('creation')) {

        element = document.createElement(component.tag) as ObjectCreationComponent;
        element.id = 'nde.features.object.sidebar.creation';

      } else if (component.tag.includes('identification')) {

        element = document.createElement(component.tag) as ObjectIdentificationComponent;
        element.collections = this.collections;
        element.id = 'nde.features.object.sidebar.identification';

      } else if (component.tag.includes('representation')) {

        element = document.createElement(component.tag) as ObjectRepresentationComponent;
        element.id = 'nde.features.object.sidebar.representation';

      } else if (component.tag.includes('dimensions')) {

        element = document.createElement(component.tag) as ObjectDimensionsComponent;
        element.id = 'nde.features.object.sidebar.dimensions';

      }

      if (window.navigator.userAgent.includes('Macintosh') && window.navigator.userAgent.includes('Chrome/')) {

        element.addEventListener('contextmenu', (event: MouseEvent) => {

          event.stopPropagation();
          event.preventDefault();

        });

      }

      this.formCards = this.formCards?.includes(element)
        ? this.formCards : [ ...this.formCards ? this.formCards : [], element ];

    }

    this.appendComponents(this.formCards);

  }

  /**
   * Appends the formCards to the page content and removes previous children
   */
  appendComponents(components: (ObjectImageryComponent
  | ObjectCreationComponent
  | ObjectIdentificationComponent
  | ObjectRepresentationComponent
  | ObjectDimensionsComponent)[]): void {

    components.forEach(async(component) => {

      component.object = this.object;
      component.formActor = this.formActor as any;
      component.translator = this.translator;
      await component?.requestUpdate('object');

    });

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

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const idle = this.state?.matches(ObjectStates.IDLE);

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const sidebarItems = this.formCards?.map((formCard) => formCard.id);

    const showLoading = !(this.state?.matches(ObjectStates.IDLE) || this.state?.matches(ObjectStates.EDITING_FIELD));

    return this.object ? html`

    ${ showLoading || !this.formCards ? html`<nde-progress-bar></nde-progress-bar>` : html``}

    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>

      <nde-form-element slot="title" class="title inverse" .showLabel="${false}" hideValidation debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="name">
        <input type="text" slot="input"  class="name" value="${this.object.name}" ?disabled="${this.isSubmitting}"/>
      </nde-form-element>
      <nde-form-element slot="subtitle" class="subtitle inverse" .showLabel="${false}" hideValidation debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="description">
        <input type="text" slot="input" class="description" value="${this.object.description}" ?disabled="${this.isSubmitting}" placeholder="${this.translator.translate('nde.common.form.description-placeholder')}"/>
      </nde-form-element>

      ${ idle && this.isDirty && this.isValid ? html`<div slot="actions"><button class="no-padding inverse save" @click="${() => { if(this.isDirty && this.isValid) { this.formActor.send(FormEvents.FORM_SUBMITTED); } }}">${unsafeSVG(Save)}</button></div>` : '' }
      ${ idle && this.isDirty ? html`<div slot="actions"><button class="no-padding inverse reset" @click="${() => { if(this.isDirty) { this.actor.send(new ClickedResetEvent()); } }}">${unsafeSVG(Cross)}</button></div>` : '' }
      <div slot="actions"><button class="no-padding inverse delete" @click="${() => this.actor.send(new ClickedDeleteObjectEvent(this.object))}">${unsafeSVG(Trash)}</button></div>
    </nde-content-header>

    <div class="content-and-sidebar">

      ${ this.formCards
    ? html`<nde-sidebar>
      <nde-sidebar-item .padding="${false}" .showBorder="${false}">
        <nde-sidebar-list slot="content">
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

    ${ this.isEditingTermField
    ? html`
      ${ this.appendComponents(this.formCards)}
      <nde-term-search .logger='${this.logger}' .actor="${this.termActor}" .translator="${this.translator}"></nde-term-search>
    `
    : this.formCards ? html`
      <div class="content" @scroll="${ () => window.requestAnimationFrame(() => { this.updateSelected(); })}">

        ${ alerts }
        ${ this.formCards }

        
      </div>
    ` : html`no formcards`}
    `
    : html``}
    </div>`
      : html``;

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
          gap: var(--gap-large);
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
      `,
    ];

  }

}
