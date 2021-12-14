import { css, html, property, LitElement, unsafeCSS, TemplateResult, CSSResult } from 'lit-element';
import { Collection, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';

/**
 * A component which shows the details of a single collection.
 */
export class CollectionCardComponent extends LitElement {

  /** The collection which will be rendered by the component */
  @property({ type: Object })
  collection?: Collection;

  /** Translator used to display last updated time */
  @property({ type: Object })
  translator?: Translator;

  /** The styles associated with the component */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css``,
    ];

  }

  render(): TemplateResult {

    return html`
      <nde-card>
        <span slot='title'>
          ${this.collection?.name ?? this.translator?.translate('collections.card.name-unavailable')}
        </span>
        <span slot='subtitle'>
          <span>
            ${this.collection?.description ?? ''}
          </span>
        </span>
      </nde-card>
    `;

  }

}

export default CollectionCardComponent;
