import { html, property, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, PropertyValues } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ArgumentError, validateWebId, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, Logo, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { AuthenticateComponent, define, hydrate } from '@digita-ai/dgt-components';
import { Issuer, Session, SolidService } from '@digita-ai/inrupt-solid-service';
import { Interpreter } from 'xstate';
import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { from, map } from 'rxjs';
import { AppContext } from '../../app.machine';
import { DismissAlertEvent } from '../../app.events';

/**
 * The root page of the authenticate feature.
 */
export class AuthenticateRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  logger: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  translator: Translator;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  appActor: Interpreter<AppContext>;

  /**
   * The component's alerts.
   */
  @internalProperty()
  alerts: Alert[];

  constructor(private solidService: SolidService) {

    super();

    define('authenticate-component', hydrate(AuthenticateComponent)(this.solidService, undefined, validateWebId));

  }

  /**
   * Hook called on first update after connection to the DOM.
   */
  firstUpdated(changed: PropertyValues): void {

    if(changed && changed.has('appActor') && !!changed.get('appActor')){

      this.subscribe('alerts', from(this.appActor)
        .pipe(map((state) => state.context?.alerts)));

    }

    super.firstUpdated(changed);

  }

  /**
   * Dsipatches an authenticated event to parent element when the user is authenticated.
   *
   * @param event the original authenticated event
   */
  private onAuthenticated = (event: CustomEvent<Session>): void => {

    this.dispatchEvent(new CustomEvent('authenticated', { detail: event.detail }));

  };

  /**
   * Handles a dismiss event by sending a dismiss alert event to its parent.
   *
   * @param event Dismiss event dispatched by an alert componet.
   */
  handleDismiss(event: CustomEvent<Alert>): void {

    if (!event || !event.detail) {

      throw new ArgumentError('Argument event || event.detail should be set.', event);

    }

    if (!this.appActor) {

      throw new ArgumentError('Argument this.appActor should be set.', this.appActor);

    }

    this.appActor.send(new DismissAlertEvent(event.detail));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const alerts = this.alerts?.map((alert) => html`
      <nde-alert
        .logger='${this.logger}'
        .translator='${this.translator}'
        .alert='${alert}'
        @dismiss="${this.handleDismiss}">
      </nde-alert>`);

    return html`
      <div class="title-container">
        ${ unsafeSVG(Logo) }
        <h1>${this.translator?.translate('authenticate.pages.login.title')}</h1>
      </div>

      <div ?hidden="${!alerts || alerts.length < 1}" slot="afterWebId" class="alert-container">
        ${ alerts }
      </div>
      
      <authenticate-component
      hideCreateNewWebId
      @authenticated="${this.onAuthenticated}"
      .textSeparator="${ this.translator?.translate('authenticate.pages.login.separator') }"
      .textWebIdLabel="${ this.translator?.translate('authenticate.pages.login.webid-label') }"
      .textWebIdPlaceholder="${ this.translator?.translate('authenticate.pages.login.webid-placeholder') }"
      .textButton="${Login}"
      .translator="${this.translator}"
      >
      </authenticate-component>

      <div class="webid-container">
        <p> ${unsafeHTML(this.translator?.translate('authenticate.pages.login.create-webid'))}</p>
      </div>`;

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
          font-size: var(--font-size-small);
        }
        :host > *:not(style) {
          width: 400px;
          max-width: 400px;
          min-width: 400px;
        }
        .title-container {
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: var(--gap-large);
          color: var(--colors-foreground-inverse);
          margin-bottom: var(--gap-large);
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
        .alert-container {
          margin-top: var(--gap-large);
        }
        authenticate-component {
          margin: var(--gap-large) 0;
        }
        authenticate-component::part(provider) {
          border: none;
          background-color: var(--colors-primary-light);
          color: var(--colors-foreground-inverse);
          cursor: pointer;
          outline: none;
          padding: 0 0 0 6.5rem;
          margin: 0;
          height: 40px;
        }

        authenticate-component::part(webid-label) {
          color: var(--colors-foreground-inverse);
          margin-bottom: calc(var(--gap-small) * -1);
        }

        authenticate-component::part(webid-input) {
          padding: var(--gap-small) var(--gap-normal);
          color: var(--colors-foreground-normal);
          font-size: var(--font-size-small);
          border: none;
          outline-style: none;
          height: 20px;
          text-overflow: ellipsis;
        }

        authenticate-component::part(separator) {
          font-size: var(--font-size-small);
          margin: var(--gap-large) auto;
          --colors-foreground-light: white;
          width: 75%;
        }
        authenticate-component::part(webid-button) {
          border: none;
          background-color: var(--colors-primary-light);
          text-transform: uppercase;
          padding: var(--gap-small);
          color: var(--colors-foreground-inverse);
          cursor: pointer;
          outline: none;
          text-transform: unset;
          font-size: var(--font-size-small);
          height: var(--gap-large);
          width: 60px;
        }
        authenticate-component::part(alert) {
          height: var(--gap-small);
          font-size: var(--font-size-small);
        }
        authenticate-component::part(loading) {
          --colors-foreground-normal: var(--colors-foreground-light);
        }

        authenticate-component::part(provider-logo) {
          display: none;
        }
        nde-form-element label {
          color: white;
        }
        .webid-container {
          margin-top: var(--gap-large);
        }
        .webid-container p {
          text-align: center;
          color: var(--colors-foreground-light);
          font-size: var(--font-size-small);
          margin: 0;
        }
        .webid-container p a {
          color: var(--colors-foreground-light);
        }
        svg {
          stroke: var(--colors-foreground-light) !important;
        } */
        `,
    ];

  }

}
