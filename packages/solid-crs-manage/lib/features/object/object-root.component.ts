import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent, FormActors, FormSubmissionStates, FormEvents, Alert, FormRootStates, FormCleanlinessStates, FormValidationStates } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ActorRef, Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Cross, Object as ObjectIcon, Save, Theme, Trash } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { ObjectImageryComponent, ObjectCreationComponent, ObjectIdentificationComponent, ObjectRepresentationComponent, ObjectDimensionsComponent } from '@netwerk-digitaal-erfgoed/solid-crs-semcom-components';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ComponentMetadata } from '@digita-ai/semcom-core';
import { AppEvents } from '../../app.events';
import { SemComService } from '../../common/semcom/semcom.service';
import { ObjectContext, ObjectStates } from './object.machine';
import { ObjectEvents } from './object.events';

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

  }

  /**
   * Hook called on at every update after connection to the DOM.
   */
  async updated(changed: PropertyValues): Promise<void> {

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

    if (this.formCards && this.object && this.translator && this.formActor) {

      this.formCards.forEach((formCard) => {

        formCard.object = this.object;
        formCard.formActor = this.formActor as any;
        formCard.translator = this.translator;

      });

    }

    if (this.formCards?.length > 0 && !this.visibleCard) {

      this.visibleCard = this.formCards[0].id;

    }

    if (!this.formCards && this.components) {

      // register and add all components
      for (const component of this.components) {

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

        element.object = this.object;
        element.formActor = this.formActor as any;
        element.translator = this.translator;

        if (window.navigator.userAgent.includes('Macintosh') && window.navigator.userAgent.includes('Chrome/')) {

          element.addEventListener('contextmenu', (event: MouseEvent) => {

            event.stopPropagation();
            event.preventDefault();

          });

        }

        this.contentElement.appendChild(element);

        this.formCards = this.formCards?.includes(element)
          ? this.formCards : [ ...this.formCards ? this.formCards : [], element ];

      }

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
  updateSelected(): void {

    this.visibleCard = Array.from(this.formCards).find((formCard) => {

      const box = formCard.getBoundingClientRect();

      return box.top > -(box.height / (3 + 20));

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

    const showLoading = !(this.state?.matches(ObjectStates.IDLE));

    return this.object ? html`

    ${ showLoading || !this.formCards ? html`<nde-progress-bar></nde-progress-bar>` : html``}

    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>

      <nde-form-element slot="title" class="title inverse" .showLabel="${false}" .showValidation="${false}" debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="name">
        <input autofocus type="text" slot="input"  class="name" value="${this.object.name}" ?disabled="${this.isSubmitting}"/>
      </nde-form-element>
      <nde-form-element slot="subtitle" class="subtitle inverse" .showLabel="${false}" .showValidation="${false}" debounceTimeout="0" .actor="${this.formActor}" .translator="${this.translator}" field="description">
        <input type="text" slot="input" class="description" value="${this.object.description}" ?disabled="${this.isSubmitting}" placeholder="${this.translator.translate('nde.common.form.description-placeholder')}"/>
      </nde-form-element>

      ${ idle && this.isValid && this.isDirty ? html`<div slot="actions"><button class="no-padding inverse save" @click="${() => { if(this.isValid && this.isDirty) { this.formActor.send(FormEvents.FORM_SUBMITTED); } }}">${unsafeSVG(Save)}</button></div>` : '' }
      ${ idle && this.isDirty ? html`<div slot="actions"><button class="no-padding inverse reset" @click="${() => { if(this.isDirty) { this.actor.send(ObjectEvents.CLICKED_RESET); } }}">${unsafeSVG(Cross)}</button></div>` : '' }
      <div slot="actions"><button class="no-padding inverse delete" @click="${() => this.actor.send(ObjectEvents.CLICKED_DELETE, { object: this.object })}">${unsafeSVG(Trash)}</button></div>
    </nde-content-header>

    <div class="content-and-sidebar">

      ${ this.formCards
    ? html`<nde-sidebar>
      <nde-sidebar-item .padding="${false}" .showBorder="${false}">
        <nde-sidebar-list slot="content">
          ${sidebarItems?.map((item) => html`
          <nde-sidebar-list-item slot="item"
            ?selected="${ item === this.visibleCard }"
            @click="${() => { Array.from(this.formCards).find((card) => card.id === item).scrollIntoView({ behavior: 'smooth', block: 'center' }); }}"
          >
            <div slot="title">${this.translator?.translate(item)}</div>
          </nde-sidebar-list-item>
          `)}
        </nde-sidebar-list>
      </nde-sidebar-item>
    </nde-sidebar>`
    : html``}


      <div class="content" @scroll="${ () => window.requestAnimationFrame(() => { this.updateSelected(); })}">

        ${ alerts }

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
