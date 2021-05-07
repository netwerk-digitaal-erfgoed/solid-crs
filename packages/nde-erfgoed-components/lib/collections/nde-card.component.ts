import { css, html, property, LitElement, unsafeCSS } from 'lit-element';
import { Theme } from '@digita-ai/nde-erfgoed-theme';

export class NDECard extends LitElement {

  @property({})
  public image: string = undefined;

  static get styles() {
    return [
      unsafeCSS(Theme),
      css`
        .nde-card:hover {
          cursor: pointer;
          transform: scale(1.1);
        }
        .nde-card {
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
        .information-pane-title, .information-pane-subtitle {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        .information-pane-subtitle {
          font-size: var(--font-size-small);
          color: var(--colors-accent-primary);
          display: block;
          height: calc(var(--line-height-large) * var(--font-size-small));
        }
        .information-pane-title {
          display: block;
          height: calc(var(--line-height-large) * var(--font-size-normal));
        }
        img {
          width: 100%;
          height: calc(100% - 2 * var(--gap-normal) - (var(--line-height-large) * (var(--font-size-normal) + var(--font-size-small))));
          object-fit: cover;
        }
      `,
    ];
  }

  render() {
    return html`
      <div class='nde-card'>
        <img src='${this.image && this.image !== 'undefined' ? this.image : 'data:image/png;base64,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'}' alt='card image'/>
        <div class='information-pane'>

          <div class='information-pane-subtitle'>
            <slot name='subtitle'></slot>
          </div>
          
          <div class='information-pane-title'>
            <slot name='title'></slot>
          </div>
        </div>
      </div>
    `;
  }
}

export default NDECard;
