import { css, html, property, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which represents a sidebar list item.
 */
export class SidebarListItemComponent extends RxLitElement {

  @property({type: Boolean})
  public inverse = false;

  @property({type: Boolean})
  public selected = false;

  @property({type: Boolean})
  public isTitle = false;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <li class="item${this.inverse ? '' : ' dark'}${this.selected ? ' selected' : ''}${this.isTitle ? ' title' : ''}">
      <slot name="title"></slot>
      <div class="actions">
        <slot name="actions"></slot>
      </div>
    </li>
  `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
      css`
      .item {
        background-color: var( --colors-background-light);
        height: 45px;
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
        justify-content: space-between;
        padding: 0 var(--gap-normal);

      }

      .item .actions {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        gap: var(--gap-small);
        font-size: 25px;
        height: 25px;
      }

      .item slot[name="title"]::slotted(*) {
        user-select: none;
        font-size: var(--font-size-normal);
        color: var( --colors-foreground-normal);
      }

      .item.dark {
        background-color: var(--colors-primary-dark);
        display: flex;
      }

      .item.dark slot[name="title"]::slotted(*) {
        color: var(--colors-foreground-inverse);
      }

      .item.dark .actions slot[name="actions"]::slotted(*) {
        color: var(--colors-foreground-inverse);
      }

      .item.selected, .item:hover:not(.title) {
        background-color: var(--colors-primary-normal);
        display: flex;
      }

      .item.selected slot[name="title"]::slotted(*), .item:hover:not(.title) slot[name="title"]::slotted(*) {
        color: var(--colors-foreground-inverse);
      }

      .item.title slot[name="title"]::slotted(*) {
        font-weight: var( --font-weight-bold);
      }
      .item.title {
        cursor: default;
      }
      .item slot[name="actions"]::slotted(*) {
        cursor: pointer;
      }
      `,
    ];
  }
}
