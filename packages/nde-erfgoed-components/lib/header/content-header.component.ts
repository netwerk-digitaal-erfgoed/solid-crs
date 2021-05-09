import { css, html, LitElement, property, unsafeCSS } from 'lit-element';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which represents a content header.
 */
export class ContentHeaderComponent extends LitElement {

  /**
   * Decides the color variant of this component (dark/light)
   */
  @property({ type: Boolean })
  public inverse = false;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <div class="header ${this.inverse ? '' : 'inverse'}">

      <div class="icon">
        <slot name="icon"></slot>
      </div>

      <div class="content">      
        <slot name="title"></slot>
        <slot name="subtitle"></slot>
      </div>

      <div class="actions">
        <slot name="actions"></slot>
      </div>

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
        .header.inverse {
          background-color: var(--colors-primary-dark);
          color: var(--colors-foreground-inverse);
          fill: var(--colors-foreground-inverse);
        }
        .header {
          background-color: var( --colors-background-light);
          color: var(--colors-foreground-normal);
          fill: var(--colors-foreground-normal);
          border-bottom: 1px solid var(--colors-primary-normal);
          height: 99px;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .header .icon {
          margin-left: var(--gap-large);
          font-size: 25px;
        }
        .header.inverse .icon ::slotted(svg) {
          fill: var(--colors-foreground-inverse);
        }
        .header .icon ::slotted(*) {
          height: 25px;
          width: 25px;
        }
        .header .content {
          flex: 1 0;
          margin: 0 var(--gap-normal);
        }
        .header .content slot[name="title"]::slotted(*) {
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-normal);
          height: var(--gap-normal);
        }
        .header .content slot[name="subtitle"]::slotted(*) {
          margin-top: var(--gap-tiny);
          font-size: var(--font-size-small);
          height: var(--gap-normal);
        }
        .header .actions {
          margin-right: var(--gap-large);
          display: flex;
          flex-direction: row;
          gap: var(--gap-normal);
        }
        .header .actions ::slotted(*) {
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
          height: var(--gap-normal);
          width: var(--gap-normal);
          fill: var(--colors-primary-light);
          color: var(--colors-primary-light);
          cursor: pointer;
        }
        .header.inverse .actions ::slotted(*) {
          fill: var(--colors-foreground-inverse);
          color: var(--colors-foreground-inverse);
        }
      `,
    ];

  }

}

export default ContentHeaderComponent;
