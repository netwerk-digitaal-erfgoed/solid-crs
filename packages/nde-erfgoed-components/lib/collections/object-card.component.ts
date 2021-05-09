import { css, html, property, LitElement, unsafeCSS } from 'lit-element';
import { CollectionObject, getFormattedTimeAgo, Translator } from '@digita-ai/nde-erfgoed-core';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which shows the details of a single collection object.
 */
export class ObjectCardComponent extends LitElement {

  /** The object which will be rendered by the component */
  @property({ type: Object })
  public object: CollectionObject = null;

  /** Translator used to display last updated time */
  @property({ type: Object })
  public translator: Translator;

  /** The styles associated with the component */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        .time-ago {
          color: var(--colors-foreground-light);
        }
      `,
    ];

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    const timeAgo = getFormattedTimeAgo(this.object.updated, this.translator);

    return html`
      <nde-card image='${this.object.image}'>
        <span slot='title'>
          ${this.object.name ?? this.translator.translate('nde.collections.card.name-unavailable')}
        </span>
        <span slot='subtitle'>
          <span class='subject'>
            ${this.object.subject ?? this.translator.translate('nde.collections.card.subject-unavailable')}
          </span>
          <span class='time-ago'>
             ${this.object.updated ? ` - ${timeAgo}` : ''}
          </span>
        </span>
      </nde-card>
    `;

  }

}

export default ObjectCardComponent;
