import { css, html, LitElement, unsafeCSS } from 'lit-element';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-cbs-theme';

/**
 * A card component
 */
export class CardComponent extends LitElement {

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        .card:hover {
          cursor: pointer;
          transform: scale(1.01);
        }
        .card {
          display: flex;
          flex-direction: column;
          transition: all .1s ease-in-out;
          line-height: var(--line-height-large);
        }
        .card .content {
          display: flex;
          flex-direction: column;
          background-color: var(--colors-foreground-inverse);
          padding: var(--gap-normal);
          flex: 0 0 53px;
        }
        .card .content .title, .card .content .subtitle {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        .card .content .subtitle {
          font-size: var(--font-size-small);
          color: var(--colors-accent-primary);
          margin-bottom: var(--gap-tiny);
        }
        .card .image {
          flex: 0 0 135px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--colors-foreground-inverse);
        }
        .card .image slot[name="image"]::slotted(*) {
          height: 135px;
          width: 100%;
          object-fit: cover;
        }
        .card .image slot[name="image"]::slotted(*) {
          fill: var(--colors-foreground-light);
        }
      `,
    ];

  }

  render() {

    return html`
      <div class='card'>
        <div class="image">
          <slot name='image'></slot>
        </div>

        <div class='content'>

          <div class='subtitle'>
            <slot name='subtitle'></slot>
          </div>
          
          <div class='title'>
            <slot name='title'></slot>
          </div>
        </div>
      </div>
    `;

  }

}

export default CardComponent;
