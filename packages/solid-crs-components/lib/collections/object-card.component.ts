import { css, html, property, LitElement, unsafeCSS, CSSResult, TemplateResult } from 'lit-element';
import { CollectionObject, getFormattedTimeAgo, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Picture, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * A component which shows the details of a single collection object.
 */
export class ObjectCardComponent extends LitElement {

  /** The object which will be rendered by the component */
  @property({ type: Object })
  object?: CollectionObject;

  /** Translator used to display last updated time */
  @property({ type: Object })
  translator?: Translator;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.object && this.translator ? html`
      <nde-card>
        ${this.object.image && this.object.image !== 'undefined' ? html`<img slot="image" src="${this.object.image}" alt="card image"/>` : html`<div slot="image">${unsafeSVG(Picture)}</div>`}
        <span slot='title'>
          ${this.object.name ?? this.translator.translate('collections.card.name-unavailable')}
        </span>
        <span slot='subtitle'>
          <span class='additionalType'>
            ${this.object.additionalType && this.object.additionalType?.length > 0 ? this.object.additionalType?.map((term) => term.name).join(', ') :  this.translator.translate('collections.card.additionalType-unavailable')}
          </span>
          <span class='time-ago'>
             ${this.object.updated ? ` - ${getFormattedTimeAgo(+this.object.updated, this.translator)}` : ''}
          </span>
        </span>
      </nde-card>
    ` : html``;

  }

  /** The styles associated with the component */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        .time-ago {
          color: var(--colors-foreground-light);
        }
        div[slot="image"] {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        div[slot="image"] svg {
          fill: var(--colors-foreground-light);
        }
      `,
    ];

  }

}

export default ObjectCardComponent;
