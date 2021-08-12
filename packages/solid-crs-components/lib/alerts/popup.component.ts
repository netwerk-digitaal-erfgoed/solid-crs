
import { css, CSSResult, html, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';

/**
 * A component that displays any content over the whole webpage
 * Hide by toggling this.hidden
 */
export class PopupComponent extends LitElement {

  /**
   * Decides whether the component has a dark background
   */
  @property({ type: Boolean })
  public dark = false;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    // initially, always hide the component
    this.hidden = true;

    return html`
    <div class="overlay${ this.dark ? ' dark' : ''}" @click="${ () => this.hidden = true }">
      <slot name="content" @click="${ (event: MouseEvent) => event.stopPropagation() }"></slot>
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
        .overlay {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          position: fixed;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .overlay ::slotted(*) {
          max-width: 90%;
          max-height: 90%;
        }
        .dark {
          background-color: rgba(0, 0, 0, 0.8);
        }
      `,
    ];

  }

}

export default PopupComponent;
