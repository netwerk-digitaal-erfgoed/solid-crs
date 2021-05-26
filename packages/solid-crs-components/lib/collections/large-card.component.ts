import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { css, html, LitElement, property, unsafeCSS } from 'lit-element';

/**
 * A large card component
 */
export class LargeCardComponent extends LitElement {

  /** Determine whether the header of the card should be shown */
  @property({ type: Boolean })
  public showHeader = true;

  /** Determine whether the image of the card should be shown */
  @property({ type: Boolean })
  public showImage = true;

  /** Determine whether the content of the card should be shown */
  @property({ type: Boolean })
  public showContent = true;

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        .large-card {
          display: flex;
          flex-direction: column;
          gap
          : 0;
        }
        .header, .content {
          background-color: var(--colors-foreground-inverse);
        }
        .content {
          padding: var(--gap-large);
        }
        .image {
          flex: 0 0 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--colors-foreground-inverse);
        }
        .image slot[name="image"]::slotted(*) {
          height: 200px;
          width: 100%;
          object-fit: cover;
        }
        .header slot[name="icon"]::slotted(*) {
          padding-left: var(--gap-normal);
          width: 25px;
          padding-right: var(--gap-normal);
          fill: var(--colors-foreground-light);
          flex-shrink: 0;
        }
        .header {
          padding: var(--gap-normal);
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .header slot[name="title"]::slotted(*) {
          color: var(--colors-foreground-normal);
          font-size: var(--font-size-normal);
        }
        .header slot[name="subtitle"]::slotted(*) {
          color: var(--colors-foreground-light);
          font-size: var(--font-size-small);
        }
        .header .titles {
          display: flex;
          flex-direction: column;
          line-height: var(--line-height-large);
        }
        .reduced-top-padding {
          padding-top: var(--gap-normal);
        }
      `,
    ];

  }

  render() {

    return html`
      <div class="large-card">

        ${this.showHeader
    ? html`
            <div class="header">
              <slot name="icon"></slot>
              <div class="titles">
                <slot name="title"></slot>
                <slot name="subtitle"></slot>
              </div>
            </div>
          `
    : html``
}
        ${this.showImage
    ? html`
          <div class="image">
            <slot name="image"></slot>
          </div>
        `
    : html``
}

        ${this.showContent
    ? html`
          <div class="content${!this.showImage ? ' reduced-top-padding' : ''}">
            <slot name="content"></slot>
          </div>
        `
    : html``
}

      </div>
    `;

  }

}

export default LargeCardComponent;
