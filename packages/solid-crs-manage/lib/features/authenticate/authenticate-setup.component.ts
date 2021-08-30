import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Interpreter } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Theme, Identity } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { ClickedAdministratorTypeEvent, ClickedInstitutionTypeEvent } from '../../app.events';
import { AppContext } from '../../app.machine';

/**
 * The first time setup page of the authenticate process.
 * The user can decide to use his own pod as storage, or to link
 * to an existing institution's pod, which they manage
 */
export class AuthenticateSetupComponent extends RxLitElement {

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
  public actor: Interpreter<AppContext>;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      <div class="title-container">
        <h1>${this.translator?.translate('authenticate.pages.setup.title')}</h1>
      </div>
      
      <div class="form-container">
        
        <nde-large-card
        class="term-card"
        .showImage="${false}"
        .showContent="${false}"
        @click=${() => this.actor.send(new ClickedAdministratorTypeEvent())}>
            <div slot="title">${ this.translator?.translate('authenticate.pages.setup.button-administrator.title') }</div>
            <div slot="subtitle">${ this.translator?.translate('authenticate.pages.setup.button-administrator.subtitle') }</div>
            <div slot="icon">
              ${unsafeSVG(Identity)}
            </div>
        </nde-large-card>
        
        <nde-large-card
        class="term-card"
        .showImage="${false}"
        .showContent="${false}"
        @click=${() => this.actor.send(new ClickedInstitutionTypeEvent())}>
            <div slot="title">${ this.translator?.translate('authenticate.pages.setup.button-institution.title') }</div>
            <div slot="subtitle">${ this.translator?.translate('authenticate.pages.setup.button-institution.subtitle') }</div>
            <div slot="icon">
              ${unsafeSVG(Identity)}
            </div>
        </nde-large-card>
      
      </div>

      <div class="webid-container">
        <p> ${unsafeHTML(this.translator?.translate('authenticate.pages.login.create-webid'))}</p>
      </div>
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
          margin-bottom: var(--gap-large);
          width: 50%;
        }

        .title-container {
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: center;
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

        .form-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
        }

        .form-container > * {
          margin-bottom: var(--gap-large);
        }

        nde-large-card {
          cursor: pointer;
        }

        svg {
          stroke: var(--colors-foreground-light) !important;
        }
        `,
    ];

  }

}
