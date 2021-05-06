import { Dismiss, Logout, Search } from '@digita-ai/nde-erfgoed-theme';
import { css, html, LitElement } from 'lit-element';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * A component which represents a content header.
 */
export class DemoContentHeaderComponent extends LitElement {

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <nde-content-header>
      <div slot="icon">${ unsafeSVG(Search) }</div>
      <div slot="title">Title</div>
      <div slot="subtitle">Subtitle</div>
      <div slot="actions">${ unsafeSVG(Dismiss) }</div>
    </nde-content-header>
    <br>
    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(Search) }</div>
      <div slot="title">Title</div>
      <div slot="subtitle">Subtitle</div>
      <div slot="actions">${ unsafeSVG(Dismiss) }</div>
      <div slot="actions">${ unsafeSVG(Logout) }</div>
    </nde-content-header>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      css`
      
      `,
    ];

  }

}

export default DemoContentHeaderComponent;
