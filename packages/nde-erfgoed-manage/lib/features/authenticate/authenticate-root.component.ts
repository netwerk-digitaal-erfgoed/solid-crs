import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { Collection, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Event } from '@digita-ai/nde-erfgoed-components';
import { SpawnedActorRef, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, NdeLogoInverse } from '@digita-ai/nde-erfgoed-theme';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext } from './authenticate.machine';

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
  public actor: SpawnedActorRef<Event<AuthenticateEvents>, State<AuthenticateContext>>;

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<AuthenticateContext>;

  /**
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <div class="title-container">
      <svg> ${ unsafeSVG(NdeLogoInverse) } </svg>
      <h1>${this.translator.translate('nde.features.authenticate.pages.login.title')}</h1>
    </div>
    <div class="form-container">
      <form>
        <nde-form-element .border="${false}" .actor="${this.actor}" .translator="${this.translator}" field="uri">
          <div slot="icon"></div>
          <input type="text" slot="input" name="webId" placeholder="${this.translator.translate('nde.features.authenticate.pages.login.search-placeholder')}" />
          <button slot="action" @click="${() => this.actor.send(AuthenticateEvents.CLICKED_LOGIN)}">${ unsafeSVG(Login) }</button>
        </nde-form-element>
      </form>
    </div>
    <div></div>
  `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        :host {
          width: 400px;
          height: 100%;
          margin: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 80px;
        }

        .title-container {
          max-height: 50px;
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .title-container svg {
          max-height: 50px;
          height: 50px;
          max-width: 50px;
          width: 50px;
        }

        .title-container h1 {
          color: white;
          font-size: var(--font-size-header-normal);
          font-weight: normal;
        }

        nde-form-element button {
          background-color: var(--colors-primary-light)
        }

        nde-form-element {
          border: none;
        }
      `,
    ];
  }

}
