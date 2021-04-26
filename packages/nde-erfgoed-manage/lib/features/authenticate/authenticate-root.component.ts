import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { Collection, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { SpawnedActorRef, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { AuthenticateEvent } from './authenticate.events';
import { AuthenticateContext } from './authenticate.context';

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
  public actor: SpawnedActorRef<AuthenticateEvent, State<AuthenticateContext>>;

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
    
  `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
      
      `,
    ];
  }

}
