import { Cross, Logout, Search, Object, Login, Edit, Bell, Loading, Trash, Dropdown, Identity, Connect, Plus, Dots, Collection, Save, Image } from '@netwerk-digitaal-erfgoed/solid-cbs-theme';
import { css, html, LitElement } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
/**
 * A component which represents different icons.
 */
export class DemoSVGComponent extends LitElement {

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <div>
      ${ unsafeSVG(Login) }
      ${ unsafeSVG(Save) }
      ${ unsafeSVG(Object) }
      ${ unsafeSVG(Trash) }
      ${ unsafeSVG(Dropdown) }
      ${ unsafeSVG(Identity) }
      ${ unsafeSVG(Connect) }
      ${ unsafeSVG(Bell) }
      ${ unsafeSVG(Search) }
      ${ unsafeSVG(Cross) }
      ${ unsafeSVG(Plus) }
      ${ unsafeSVG(Dots) }
      ${ unsafeSVG(Collection) }
      ${ unsafeSVG(Image) }
      ${ unsafeSVG(Logout) }
      ${ unsafeSVG(Loading) }
      ${ unsafeSVG(Edit) }
    </div>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      css`
      div {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      div svg {
        margin-right: var(--gap-normal);
        height: var(--gap-large);
        fill: var(--colors-foreground-normal);
      }
      `,
    ];

  }

}

export default DemoSVGComponent;
