import { css, html, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Search, Theme } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * A component which represents a sidebar list item.
 */
export class DemoSidebarListComponent extends RxLitElement {

  public items = [ 'Collectie 1', 'Collectie 2', 'Collectie 3', 'Collectie 4' ];

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <nde-sidebar-list>
      <nde-sidebar-list-item slot="item" isTitle><p slot="title">Collecties</p><div slot="actions">${ unsafeSVG(Search) }</div><div slot="actions">${ unsafeSVG(Search) }</div></nde-sidebar-list-item>
      ${this.items?.map((item) => html`<nde-sidebar-list-item slot="item"><p slot="title">${item}</p></nde-sidebar-list-item>`)}
    </nde-sidebar-list>
  `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
      css``,
    ];
  }
}
