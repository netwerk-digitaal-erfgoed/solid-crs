import { html, property, unsafeCSS, css, TemplateResult, CSSResult, internalProperty } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Theme, Identity } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { from } from 'rxjs';
import { ClickedAdministratorTypeEvent, ClickedCreatePodEvent, ClickedInstitutionTypeEvent, ClickedLogoutEvent } from '../../app.events';
import { AppContext, AppDataStates, AppRootStates } from '../../app.machine';

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
   * The state of this component.
   */
  @internalProperty()
  state: State<AppContext>;

  protected firstUpdated(): void {

    this.subscribe('state', from(this.actor));

  }

  private onClickedCreatePod = () => {

    this.actor.send(new ClickedCreatePodEvent());

  };

  private onClickedCancel = () => {

    this.actor.send(new ClickedLogoutEvent());

  };

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.state?.matches({ [AppRootStates.DATA]: AppDataStates.DETERMINING_POD_TYPE })
      // admin - institution buttons
      ? html`
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
    `
    // create pod buttons
      : html`
      
      <div class="title-container">
        <h1>${this.translator?.translate('authenticate.pages.no-pod.title')}</h1>
      </div>

      <div class="form-container">
        <p>${this.translator?.translate('authenticate.pages.no-pod.subtitle.no-storage')}</p>
        <p>${unsafeHTML(this.translator?.translate('authenticate.pages.no-pod.subtitle.add-storage'))}</p>
      </div>

      <div class="button-container">
        <button class="primary" @click="${this.onClickedCreatePod}">${this.translator?.translate('authenticate.pages.no-pod.button-create-pod')}</button>
        <button class="gray" @click="${this.onClickedCancel}">${this.translator?.translate('authenticate.pages.no-pod.button-cancel')}</button>
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
          color: var(--colors-foreground-inverse);
          gap: var(--gap-huge);
        }
        
        :host > * {
          width: 500px;
        }

        .title-container {
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
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
          gap: var(--gap-normal);
        }

        .button-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: var(--gap-normal);
        }

        nde-large-card {
          cursor: pointer;
        }

        svg {
          stroke: var(--colors-foreground-light) !important;
        }

        p {
          text-align: center;
          font-size: var(--font-size-small);
          margin: 0;
        }
        `,
    ];

  }

}
