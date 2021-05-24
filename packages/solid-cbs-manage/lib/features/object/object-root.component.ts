import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { ArgumentError, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-cbs-core';
import { FormEvent, FormActors, FormSubmissionStates, FormEvents, Alert } from '@netwerk-digitaal-erfgoed/solid-cbs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ActorRef, Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Cross, Object as ObjectIcon, Save, Theme, Trash } from '@netwerk-digitaal-erfgoed/solid-cbs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AppEvents } from '../../app.events';
import { ObjectContext, ObjectStates } from './object.machine';
import { ObjectEvents } from './object.events';

/**
 * The root page of the object feature.
 */
export class ObjectRootComponent extends RxLitElement {

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

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    return this.object ? html`
    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
      ${this.state.matches(ObjectStates.EDITING)
    ? html`
          <nde-form-element slot="title" .inverse="${true}" .showLabel="${false}" .actor="${this.formActor}" .translator="${this.translator}" field="name">
            <input autofocus type="text" slot="input" class="name" value="${this.object.name}"/>
          </nde-form-element>
          <nde-form-element slot="subtitle" .inverse="${true}" .showLabel="${false}" .actor="${this.formActor}" .translator="${this.translator}" field="description">
            <input type="text" slot="input" class="description" value="${this.object.description}"/>
          </nde-form-element>
        `
    : html`
          <div slot="title" @click="${() => this.actor.send(ObjectEvents.CLICKED_EDIT)}">
            ${this.object.name}
          </div>
          <div slot="subtitle" @click="${() => this.actor.send(ObjectEvents.CLICKED_EDIT)}">
            ${this.object.description}
          </div>
        `
}

      ${ this.state.matches(ObjectStates.EDITING) ? html`<div slot="actions"><button class="no-padding inverse save" @click="${() => this.formActor.send(FormEvents.FORM_SUBMITTED)}" ?disabled="${this.isSubmitting}">${unsafeSVG(Save)}</button></div>` : '' }
      ${ this.state.matches(ObjectStates.EDITING) ? html`<div slot="actions"><button class="no-padding inverse cancel" @click="${() => this.actor.send(ObjectEvents.CANCELLED_EDIT)}">${unsafeSVG(Cross)}</button></div>` : '' }
      <div slot="actions"><button class="no-padding inverse delete" @click="${() => this.actor.send(ObjectEvents.CLICKED_DELETE, { object: this.object })}">${unsafeSVG(Trash)}</button></div>
    </nde-content-header>
    <div class="content">
      ${ alerts }
      
      FORMULIEREN

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
        .content {
          margin-top: 1px;
          padding: var(--gap-large);
          height: 100%;
          overflow-y: auto;
        }
        nde-content-header nde-form-element input {
          height: var(--gap-normal);
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
      `,
    ];

  }

}
