import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { css, CSSResult, html, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';

/**
 * A large card component
 */
export class LargeCardComponent extends LitElement {

  /** Determine whether the header of the card should be shown */
  @property({ type: Boolean })
  showHeader = true;

  /** Determine whether the image of the card should be shown */
  @property({ type: Boolean })
  showImage = true;

  /** Determine whether the content of the card should be shown */
  @property({ type: Boolean })
  showContent = true;

  render(): TemplateResult {

    return html`
      <div class="large-card">

        ${this.showHeader
    ? html`
            <nde-content-header inverse noBorder>
              <slot name="icon" slot="icon"></slot>
              <slot name="title" slot="title"></slot>
              <slot name="subtitle" slot="subtitle"></slot>
              <slot name="actions" slot="actions"></slot>
            </nde-content-header>
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

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        .large-card {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        nde-content-header {
          border: none;
        }
        .content {
          background-color: var(--colors-foreground-inverse);
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
        .reduced-top-padding {
          padding-top: var(--gap-normal);
        }
      `,
    ];

  }

}

export default LargeCardComponent;
