import { html, property, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Logo, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { AuthenticateComponent, define, hydrate } from '@digita-ai/dgt-components';
import { Issuer, SolidService } from '@digita-ai/inrupt-solid-service';

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
   * List of predefined issuers.
   */
  @internalProperty()
  issuers: Issuer[] = [ {
    uri: 'https://id.netwerkdigitaalerfgoed.nl/',
    description: 'Log in met je NDE account',
    icon: '',
  } ];

  constructor(private solidService: SolidService) {

    super();

    define('authenticate-component', hydrate(AuthenticateComponent)(this.solidService));

  }

  private onAuthenticated = (event: CustomEvent<unknown>): void => {

    alert('authenticated');

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
        .textButton="${ 'O' }"
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
          padding: var(--gap-small);
          color: var(--colors-foreground-normal);
          font-size: var(--font-size-small);
          width: calc(85% - (2 * var(--gap-small)));
          border: none;
          height: 20px;
        }

        authenticate-component::part(t) {
          font-size: var(--font-size-small);
          width: 75%;
          margin: var(--gap-large) auto;
          --colors-foreground-light: white;
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
          width: 15%;
          padding-left: 0;
          padding-right: 0;
          margin-top: -60px;
          height: 40px;
          align-self: flex-end
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
