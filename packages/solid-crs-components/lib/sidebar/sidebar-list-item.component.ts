import { css, html, internalProperty, property, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { classMap } from 'lit-html/directives/class-map';

/**
 * A component which represents a sidebar list item.
 */
export class SidebarListItemComponent extends RxLitElement {

  @property({ type: Boolean })
  public inverse = false;

  @property({ type: Boolean })
  public selected = false;

  @property({ type: Boolean })
  public isTitle = false;

  @internalProperty()
  private classes = () => ({ inverse: this.inverse, selected: this.selected, title: this.isTitle });

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <li class="item ${classMap(this.classes())}">
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
      .item.inverse {
        background-color: var(--colors-primary-dark);
        color: var(--colors-foreground-inverse);
        fill: var(--colors-foreground-inverse);
      }

      .item {
        background-color: var( --colors-background-light);
        color: var(--colors-foreground-normal);
        fill: var(--colors-foreground-normal);
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
        justify-content: space-between;
        padding: var(--gap-small) var(--gap-large);
        height: var(--font-size-header-normal);
      }

      .item.selected, .item:hover:not(.title) {
        background-color: var(--colors-primary-normal);
        display: flex;
      }

      .item slot[name="title"]::slotted(*) {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item.selected slot[name="title"]::slotted(*), .item:hover:not(.title) slot[name="title"]::slotted(*) {
        color: var(--colors-foreground-inverse);
      }

      .item.title slot[name="title"]::slotted(*) {
        font-weight: var( --font-weight-bold);
      }

      .item.title {
        cursor: default;
        padding: var(--gap-normal) var(--gap-large) 0;
      }

      .actions {
        display: flex;
        flex-direction: row;
        gap: var(--gap-normal);
      }

      .actions ::slotted(*) {
        max-height: var(--gap-normal);
        max-width: var(--gap-normal);
        height: var(--gap-normal);
        width: var(--gap-normal);
        fill: var(--colors-primary-normal);
        color: var(--colors-primary-normal);
        cursor: pointer;
      }
      .item.inverse .actions ::slotted(*) {
        fill: var(--colors-foreground-inverse);
        color: var(--colors-foreground-inverse);
      }
      `,
    ];

  }

}
