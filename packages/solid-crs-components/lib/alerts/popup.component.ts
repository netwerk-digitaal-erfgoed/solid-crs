
import { css, CSSResult, html, property, PropertyValues, query, TemplateResult, unsafeCSS } from 'lit-element';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { RxLitElement } from 'rx-lit';

/**
 * A component that displays any content over the whole webpage
 * Hide by toggling this.hidden
 */
export class PopupComponent extends RxLitElement {

  /**
   * The content element of this component
   */
  @query('slot[name="content"]')
  content: HTMLSlotElement;

  /**
   * Decides whether the component has a dark background
   */
  @property({ type: Boolean })
  public dark = false;

  /**
   * Hides/shows the component
   */
  toggle(): void {

    this.hidden ? this.show() : this.hide();

  }

  /**
   * Shows the component
   */
  show(): void {

    this.hidden = false;

  }

  /**
   * Hides the component
   */
  hide(): void {

    this.hidden = true;

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    // initially, always hide the component
    this.hide();

    return html`
    <div class="overlay${ this.dark ? ' dark' : ''}" @click="${ () => this.hide() }">
      <slot name="content" @click="${ (event: MouseEvent) => event.stopPropagation() }"></slot>
    </div>
  `;

  }

  constructor() {

    super();

    document.addEventListener('keydown', (event) => {

      if (event.key === 'Escape') {

        this.hide();

      }

    });

  }
  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          position: fixed;
          z-index: 20;
        }
        .overlay {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .dark {
          background-color: rgba(0, 0, 0, 0.8);
        }
      `,
    ];

  }

}

export default PopupComponent;
