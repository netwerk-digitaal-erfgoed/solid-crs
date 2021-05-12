import { css, html, property, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which represents a sidebar item.
 */
export class SidebarItemComponent extends RxLitElement {

  /**
   * Indicate wether padding should be automatically applied
   */
  @property({ type: Boolean })
  public padding = true;

  /**
   * Indicate wether the bottom border should be shown
   */
  @property({ type: Boolean })
  public showBorder = true;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <div class="${this.showBorder ? ' border': ''}${this.padding ? ' padding' : ''}">
      <slot name="content"></slot>
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
        .border {
          border-bottom: 1px solid var(--colors-primary-normal);
        }
        .padding {
          padding: var(--gap-normal) var(--gap-large);
        }
      `,
    ];

  }

}
