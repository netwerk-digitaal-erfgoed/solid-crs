import { css, CSSResult, html, property, TemplateResult, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Dropdown, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';

/**
 * A component for paginator controls.
 */
export class PaginatorComponent extends RxLitElement {

  /**
   * The index of the page curently being viewed.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The index of the page curently being viewed.
   */
  @property({ type: Number })
  public pageIndex: number;

  /**
   * The amount of objects to show per page.
   */
  @property({ type: Number })
  public objectsPerPage: number;

  /**
   * The total amount of objects.
   */
  @property({ type: Number })
  public objectsAmount: number;

  /**
   * Emits a custom next event.
   */
  private onNext(): void {

    this.dispatchEvent(new CustomEvent('next'));

  }

  /**
   * Emits a custom previous event.
   */
  private onPrevious(): void {

    this.dispatchEvent(new CustomEvent('previous'));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    <!-- e.g. page 1 of 10 -->
      <p>${this.translator.translate('common.paginator.page-counter')
    .replace('{CURRENT}', (this.pageIndex+1).toString())
    .replace('{TOTAL}', Math.ceil(this.objectsAmount / this.objectsPerPage).toString())}
      </p>

      <!-- previous button -->
      <button
        .disabled="${this.pageIndex < 1}"
        class="previous"
        @click="${this.onPrevious}">
        ${ unsafeSVG(Dropdown) }
      </button> 

      <!-- next button -->
      <button
        .disabled="${(this.pageIndex + 1) * this.objectsPerPage >= this.objectsAmount}"
        class="next"
        @click="${this.onNext}">
        ${ unsafeSVG(Dropdown) }
      </button> 

    <!-- </div> -->
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          display: flex;
          justify-content: flex-end;
          gap: var(--gap-normal);
          height: var(--gap-normal);
        }
        :host[hidden] {
          display: none;
        }
        :host > * {
          margin: 0;
          padding: 0;
          display: block;
          background-color: unset;
          font-size: var(--font-size-small);
          line-height: var(--gap-normal);
          min-width: var(--gap-normal);
        }
        :host svg {
          fill: var(--colors-primary-dark);
        }
        button:disabled svg {
          fill: var(--colors-foreground-light);
        }
        .previous svg {
          transform: rotate(90deg);
        }
        .next svg {
          transform: rotate(270deg);
        }
      `,
    ];

  }

}
