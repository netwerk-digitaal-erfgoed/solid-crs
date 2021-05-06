import { css, html, property, LitElement, unsafeCSS } from 'lit-element';
import { CollectionObject, getFormattedTimeAgo, Translator } from '@digita-ai/nde-erfgoed-core';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

/**
 * A component which shows the details of a single collection.
 */
export class CollectionObjectCardComponent extends LitElement {
  /** The object which will be rendered by the component */
  @property({ type: Object })
  private object: CollectionObject = null;

  /** Translator used to display last updated time */
  @property({type: Translator})
  public translator: Translator;

  /** The styles associated with the component */
  static get styles() {
    return [
      unsafeCSS(Theme),
      css`
        .collection-object-card:hover {
          cursor: pointer;
          border: 1px solid var(--colors-foreground-normal);
          transform: scale(1.1);
        }
        .collection-object-card {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          transition: all .2s ease-in-out;
          line-height: var(--line-height-large);
        }
        .information-pane {
          background-color: var(--colors-foreground-inverse);
          padding: var(--gap-normal);
        }
        .information-pane-name, .information-pane-subject-time-ago-wrapper {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        .information-pane-subject {
          color: var(--colors-accent-primary);
        }
        .information-pane-time-ago {
          font-size: var(--font-size-small);
          color: var(--colors-foreground-light);
        }
        img {
          width: 100%;
          height: calc(100% - 2 * (var(--gap-normal) + var(--line-height-large) * var(--font-size-normal)));
          object-fit: cover;
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
      <div class='collection-object-card'>
        <img src='${this.object.image}'/>
        <div class='information-pane'>
          <div class='information-pane-subject-time-ago-wrapper'>
            <span class='information-pane-subject'>${this.object.subject ?? this.translator.translate('nde.collections.card.subject-unavailable')}</span>
            <span class='information-pane-time-ago'> - ${timeAgo}</span>
          </div>
          <div class='information-pane-name'>${this.object.name ?? this.translator.translate('nde.collections.card.name-unavailable')}</div>
        </div>
      </div>
    `;
  }
}

export default CollectionObjectCardComponent;
