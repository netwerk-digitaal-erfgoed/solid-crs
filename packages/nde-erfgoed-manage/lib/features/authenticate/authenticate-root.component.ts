import { html, property, PropertyValues, internalProperty, unsafeCSS, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ArgumentError, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Event, FormActors, FormRootStates, FormSubmissionStates, FormCleanlinessStates, FormValidationStates, FormEvents, Alert } from '@digita-ai/nde-erfgoed-components';
import { ActorRef, Interpreter, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, NdeLogoInverse, Theme } from '@digita-ai/nde-erfgoed-theme';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { authn } from '@digita-ai/nde-erfgoed-client';
import { AppEvents } from '../../app.events';
import { AuthenticateContext } from './authenticate.machine';

authn.login({
  oidcIssuer: 'https://broker.pod.inrupt.com',
  redirectUrl: window.location.href,
  clientName: 'Getting started app',
});

/**
 * The root page of the authenticate feature.
 */
export class AuthenticateRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
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
  formActor: ActorRef<Event<FormEvents>>;

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<AuthenticateContext>;

  /**
   * The state of this component.
   */
  @internalProperty()
  enableSubmit?: boolean;

  /**
   * Hook called on at every update after connection to the DOM.
   */
  updated(changed: PropertyValues) {
    super.updated(changed);

    if(changed.has('actor')){
      this.subscribe('formActor', from(this.actor).pipe(
        map((state) => state.children[FormActors.FORM_MACHINE]),
      ));

      if(this.actor.parent) {
        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((state) => state.context.alerts)));
      }
    }

    if(changed.has('formActor')){
      this.subscribe('enableSubmit', from(this.formActor).pipe(
        map((state) => state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
            [FormRootStates.VALIDATION]: FormValidationStates.VALID,
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
  handleDismiss(event: CustomEvent<Alert>) {
    if (!event || !event.detail) {
      throw new ArgumentError('Argument event || event.detail should be set.', event && event.detail);
    }

    if (!this.actor || !this.actor.parent) {
      throw new ArgumentError('Argument this.actor || !this.actor.parent should be set.', this.actor || !this.actor.parent);
    }

    this.actor.parent.send(AppEvents.DISMISS_ALERT, { alert: event.detail });
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    return html`
      <div class="title-container">
        ${ unsafeSVG(NdeLogoInverse) }
        <h1>${this.translator?.translate('nde.features.authenticate.pages.login.title')}</h1>
      </div>
      <div class="form-container">
        ${ alerts }
        ${ this.formActor ? html`
        <form>
          <nde-form-element .inverse="${true}" .actor="${this.formActor}" .translator="${this.translator}" field="webId">
            <label slot="label" for="webid">${this.translator?.translate('nde.features.authenticate.pages.login.webid-label')}</label>
            <div slot="icon"></div>
            <input type="text" slot="input" placeholder="${this.translator?.translate('nde.features.authenticate.pages.login.webid-placeholder')}" />
            <button slot="action" class="primary" ?disabled="${!this.enableSubmit}" @click="${() => this.formActor.send(FormEvents.FORM_SUBMITTED)}">${ unsafeSVG(Login) }</button>
          </nde-form-element>
        </form>
        ` : html``}
      </div>
      <div class="webid-container">
        <p> ${unsafeHTML(this.translator?.translate('nde.features.authenticate.pages.login.create-webid'))}</p>
      </div>`;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
      css`
        :host {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: var(--gap-huge);
        }

        
        .title-container {
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          color: var(--colors-foreground-inverse);
          width: 400px;
        }
        
        .title-container svg {
          max-height: 50px;
          height: 50px;
          max-width: 50px;
          width: 50px;
          fill: var(--colors-foreground-inverse);
        }
        
        .title-container h1 {
          font-size: var(--font-size-header-normal);
          font-weight: normal;
        }
        
        nde-form-element label {
          color: white;
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
          width: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          gap: var(--gap-large);
        }
      `,
    ];
  }

}
