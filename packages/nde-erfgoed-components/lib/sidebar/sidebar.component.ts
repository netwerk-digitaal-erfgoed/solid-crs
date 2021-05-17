import { css, html, property, unsafeCSS } from 'lit-element';
import { Translator, Logger } from '@digita-ai/nde-erfgoed-core';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which represents a sidebar.
 */
export class SidebarComponent extends RxLitElement {

  /**
   * The component's translator.
   */
  @property({ type: Translator })
  public translator: Translator;

  /**
   * The component's translator.
   */
  @property({ type: Logger })
  public logger: Logger;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <div class="sidebar primary">
      <slot></slot>
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
        :host {
          width: var(--size-sidebar);
          display: flex;
          flex-direction: column;
        }
        .sidebar {
          flex: 1 0;
        }
        .sidebar.primary {
          background-color: var(--colors-primary-dark);
          color: var(--colors-foreground-inverse);
        }
      `,
    ];

  }

}
