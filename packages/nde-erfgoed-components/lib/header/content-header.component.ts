import { css, html, LitElement, property, unsafeCSS } from 'lit-element';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which represents a content header.
 */
export class ContentHeaderComponent extends LitElement {

  /**
   * The component's translator.
   */
  @property({type: Boolean})
  public inverse = false;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <div class="header ${this.inverse ? '' : 'dark'}">

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
        .header.dark {
          background-color: var(--colors-primary-dark);
          color: var(--colors-foreground-inverse);
          border-color: var(--colors-primary-normal);
        }
        .header {
          background-color: var( --colors-background-light);
          color: var(--colors-foreground-normal);
          border-bottom: 1px solid var(--colors-primary-dark);
          max-height: 100px;
          height: 100px;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .icon {
          height: 25px;
          width: 25px;
          font-size: 25px;
          margin-left: var(--gap-normal);
          cursor: pointer;
        }
        .icon ::slotted(*) {
          height: 100%;
          width: 100%;
        }
        .content {
          flex: 1 0;
          margin: 0 var(--gap-normal);
        }
        .content :first-child::slotted(*) {
          font-size: var(--font-size-normal);
          height: var(--gap-normal);
        }
        .content :last-child::slotted(*) {
          margin-top: var(--gap-tiny);
          font-size: var(--font-size-small);
          height: var(--gap-normal);
        }
        .actions ::slotted(*) {
          margin-right: var(--gap-normal);
          height: 25px;
          width: 25px;
          font-size: 25px;
          cursor: pointer;
        }
      `,
    ];
  }
}

export default ContentHeaderComponent;
