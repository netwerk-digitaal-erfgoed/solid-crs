import { html, css, TemplateResult, CSSResult, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';

export class LoanDetailComponent extends RxLitElement {

  constructor(
    public translator: Translator,
    public logger: Logger,
  ) {

    super();

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      LOAN DETAIL
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`

      `,
    ];

  }

}
