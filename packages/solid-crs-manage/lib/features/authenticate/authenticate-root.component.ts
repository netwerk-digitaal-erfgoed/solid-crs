import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ArgumentError, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent, FormActors, FormRootStates, FormSubmissionStates, FormCleanlinessStates, FormValidationStates, FormEvents, Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ActorRef, Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, Logo, Theme, Loading } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { AppEvents } from '../../app.events';
import { AuthenticateContext, AuthenticateStates } from './authenticate.machine';

/**
 * The root page of the authenticate feature.
 */
export class AuthenticateRootComponent extends RxLitElement {

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
  public actor: Interpreter<AuthenticateContext>;

  /**
   * The component's alerts.
   */
  @internalProperty()
  alerts: Alert[];

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  formActor: ActorRef<FormEvent>;

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<AuthenticateContext>;

  /**
   * Indicates if the form can be submitted.
   */
  @internalProperty()
  canSubmit? = false;

  /**
   * Indicates if the form is being submitted.
   */
  @internalProperty()
  isSubmitting? = false;

  /**
   * Indicates if the state is INITIAL.
   */
  @internalProperty()
  isInitializing? = false;

  /**
   * Indicates if the user is being redirected.
   */
  @internalProperty()
  isRedirecting? = false;

  /**
   * Hook called on at every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed.has('actor') && this.actor){

      this.subscribe('formActor', from(this.actor).pipe(
        map((state) => state.children[FormActors.FORM_MACHINE]),
      ));

      if(this.actor.parent) {

        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((state) => state.context?.alerts)));

      }

      this.subscribe('isInitializing', from(this.actor).pipe(
        map((state) => state.matches(AuthenticateStates.INITIAL)),
      ));

      this.subscribe('isRedirecting', from(this.actor).pipe(
        map((state) => state.matches(AuthenticateStates.REDIRECTING)),
      ));

    }

    if(changed.has('formActor') && this.formActor){

      this.subscribe('canSubmit', from(this.formActor).pipe(
        map((state) => state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
            [FormRootStates.VALIDATION]: FormValidationStates.VALID,
          },
        })),
      ));

      this.subscribe('isSubmitting', from(this.formActor).pipe(
        map((state) => state.matches(FormSubmissionStates.SUBMITTING)),
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

    return html`
      <div class="title-container">
        ${ unsafeSVG(Logo) }
        <h1>${this.translator?.translate('nde.features.authenticate.pages.login.title')}</h1>
      </div>
      ${this.isInitializing || this.isRedirecting ? html`${unsafeSVG(Loading)}` : html`
        <div class="form-container">
          ${ alerts }
          
          <form onsubmit="return false">
            <nde-form-element .inverse="${true}" .actor="${this.formActor}" .translator="${this.translator}" field="webId">
              <label slot="label" for="webid">${this.translator?.translate('nde.features.authenticate.pages.login.webid-label')}</label>
              <input type="text" name="webid" id="webid" slot="input" ?disabled="${this.isSubmitting}" placeholder="${this.translator?.translate('nde.features.authenticate.pages.login.webid-placeholder')}" autocomplete="url"/>
              <button type="button" slot="action" class="primary" ?disabled="${!this.canSubmit || this.isSubmitting}" @click="${() => this.formActor?.send(FormEvents.FORM_SUBMITTED)}">${ unsafeSVG(Login) }</button>
            </nde-form-element>
          </form>
        
        </div>
        <div class="webid-container">
          <p> ${unsafeHTML(this.translator?.translate('nde.features.authenticate.pages.login.create-webid'))}</p>
        </div>
      `}
      `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: var(--colors-primary-dark);
        }
        
        :host > * {
          margin-bottom: var(--gap-huge);
          width: 400px;
        }

        .title-container {
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          color: var(--colors-foreground-inverse);
        }
        
        .title-container svg {
          max-height: 50px;
          height: 50px;
          max-width: 50px;
          width: 50px;
          fill: var(--colors-foreground-inverse);
          stroke: none !important;
        }
        
        .title-container h1 {
          font-size: var(--font-size-header-normal);
          font-weight: normal;
        }
        
        nde-form-element label {
          color: white;
        }

        nde-form-element input {
          height: 100%;
        }

        .webid-container p {
          text-align: center;
          color: var(--colors-foreground-light);
          font-size: var(--font-size-small);
        }

        .webid-container p a {
          color: var(--colors-foreground-light);
        }

        .form-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
        }

        .form-container > * {
          margin-bottom: var(--gap-large);
        }

        svg {
          stroke: var(--colors-foreground-light) !important;
        }
        `,
    ];

  }

}
