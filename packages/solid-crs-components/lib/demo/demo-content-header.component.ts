import { Cross, Logout, Search } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { css, CSSResult, html, LitElement, TemplateResult } from 'lit-element';
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
  render(): TemplateResult {

    return html`
    <nde-content-header>
      <div slot="icon">${ unsafeSVG(Search) }</div>
      <div slot="title">Title</div>
      <div slot="subtitle">Subtitle</div>
      <div slot="actions">${ unsafeSVG(Cross) }</div>
    </nde-content-header>
    <br>
    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(Search) }</div>
      <div slot="title">Title</div>
      <div slot="subtitle">Subtitle</div>
      <div slot="actions">${ unsafeSVG(Cross) }</div>
      <div slot="actions">${ unsafeSVG(Logout) }</div>
    </nde-content-header>
    <nde-progress-bar type="indeterminate"></nde-progress-bar>
    <nde-progress-bar type="determinate" value="75"></nde-progress-bar>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      css`
      
      `,
    ];

  }

}

export default DemoContentHeaderComponent;
