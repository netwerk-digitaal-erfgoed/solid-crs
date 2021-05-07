import { css, html, property, LitElement, unsafeCSS } from 'lit-element';
import { Collection, getFormattedTimeAgo, Translator } from '@digita-ai/nde-erfgoed-core';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which shows the details of a single collection.
 */
export class CollectionCardComponent extends LitElement {

  /** The collection which will be rendered by the component */
  @property({ type: Object })
  public collection: Collection = null;

  /** Translator used to display last updated time */
  @property({ type: Object })
  public translator: Translator;

  /** The styles associated with the component */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css``,
    ];

  }

  render() {

    return html`
      <nde-card>
        <span slot='title'>
          ${this.collection?.name ?? this.translator.translate('nde.collections.card.name-unavailable')}
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
