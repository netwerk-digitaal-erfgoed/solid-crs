import { css, html, property, unsafeCSS } from 'lit-element';
import { Translator, Logger } from '@digita-ai/nde-erfgoed-core';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which represents a sidebar.
 */
export class ContentHeaderComponent extends RxLitElement {

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The component's translator.
   */
  @property({type: Logger})
  public logger: Logger;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <div class="header-content dark">
    <slot name="icon">
      <div class="dots">&#xFE19;</div>
    </slot>
    <div class="content">      
      <slot name="titles"><h1>Title</h1></slot>
      <slot name="subtile"><h2>This is a subtitle</h2></slot>
    </div>
    <slot name="actions">
      <div class="dots">&#xFE19;</div>
    </slot>
    </div>
  `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
      css`
        .header-content {
          padding: var(--gap-normal) var(--gap-small);
          display: flex;
          align-items: center;
        }
        .header-content div {
          margin: 0 var(--gap-small);
        }
        .header-content.dark {
          background-color: var(--colors-primary-dark);
        }
        .header-content .content {
          flex: 1 0;
        }
        .header-content h1 {
          font-size: var(--font-size-header-normal);
          font-weight: var(--font-weight-bold);
          color: var(--colors-foreground-inverse);
        }
        .header-content h2 {
          font-size: var(--font-size-normal);
          font-weight:normal;
          color: var(--colors-foreground-inverse);
        }
        .header-content .dots {
          font-size: 2em;
          color: var(--colors-foreground-inverse);
        }
      `,
    ];
  }
}
