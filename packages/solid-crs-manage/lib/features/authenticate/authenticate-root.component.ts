import { html, property, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Logger, Translator, validateWebId } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, Logo, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { AuthenticateComponent, define, hydrate } from '@digita-ai/dgt-components';
import { Client, Issuer, Session, SolidService } from '@digita-ai/inrupt-solid-service';

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
   * List of predefined issuers.
   */
  @internalProperty()
  issuers: Issuer[] = [ {
    uri: process.env.VITE_ID_PROXY_URI,
    description: 'Log in met je NDE account',
    icon: '',
  } ];

  constructor(private solidService: SolidService) {

    super();

    define('authenticate-component', hydrate(AuthenticateComponent)(this.solidService, undefined, validateWebId));

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
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      <div class="title-container">
        ${ unsafeSVG(Logo) }
        <h1>${this.translator?.translate('authenticate.pages.login.title')}</h1>
      </div>
      
      <authenticate-component
        hideCreateNewWebId
        @authenticated="${this.onAuthenticated}"
        .predefinedIssuers="${this.issuers}"
        .textSeparator="${ this.translator?.translate('authenticate.pages.login.separator') }"
        .textWebIdLabel="${ this.translator?.translate('authenticate.pages.login.webid-label') }"
        .textWebIdPlaceholder="${ this.translator?.translate('authenticate.pages.login.webid-placeholder') }"
        .textButton="${Login}"
        .translator="${this.translator}"
      ></authenticate-component>

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
          gap: 80px;
          background-color: var(--colors-primary-dark);
        }
        authenticate-component {
          width: 400px;
          max-width: 400px;
          min-width: 400px;
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
          font-size: var(--font-size-small);
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

        .title-container {
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: var(--gap-large);
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
