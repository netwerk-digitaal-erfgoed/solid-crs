import { css, html, property, LitElement, unsafeCSS } from 'lit-element';
import { CollectionObject, getFormattedTimeAgo, Translator } from '@netwerk-digitaal-erfgoed/solid-cbs-core';
import { Picture, Theme } from '@netwerk-digitaal-erfgoed/solid-cbs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

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

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    const timeAgo = getFormattedTimeAgo(this.object.updated, this.translator);

    return html`
      <nde-card>
        ${this.object.image && this.object.image !== 'undefined' ? html`<img slot="image" src="${this.object.image}" alt="card image"/>` : html`<div slot="image">${unsafeSVG(Picture)}</div>`}
        <span slot='title'>
          ${this.object.name ?? this.translator?.translate('nde.features.collections.card.name-unavailable')}
        </span>
        <span slot='subtitle'>
          <span class='subject'>
            ${this.object.subject ?? this.translator?.translate('nde.features.collections.card.subject-unavailable')}
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
