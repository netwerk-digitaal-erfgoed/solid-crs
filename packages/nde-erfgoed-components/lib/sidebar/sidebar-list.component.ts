import { css, html, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which represents a sidebar list item.
 */
export class SidebarListComponent extends RxLitElement {

  /**
   * Selects clicked list item and deslected all other list items.
   *
   */
  select(event: MouseEvent){
    const element = event.composedPath().find((el: Element) => el.localName === 'nde-sidebar-list-item') as Element;
    if(element && !element.hasAttribute('isTitle')){
      for(let i = 0; i < this.children.length; i++) {
        this.children.item(i).removeAttribute('selected');
      }
      element.setAttribute('selected', '');
    }
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <div class="list">
      <slot name="item" @click="${this.select}"></slot>
    </div>
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
