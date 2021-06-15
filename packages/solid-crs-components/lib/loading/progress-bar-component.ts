import { css, html, LitElement, property, unsafeCSS } from 'lit-element';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';

/**
 * A component which represents a sidebar item.
 */
export class ProgressBarComponent extends LitElement {

  /**
   * The type of progress bar to display
   */
  @property({ type: String })
  public type: 'indeterminate' | 'determinate' = 'indeterminate';

  /**
   * The type of progress bar to display
   */
  @property({ type: Number })
  public value: number;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return this.type === 'determinate'
      ? html`
        <progress class="determinate" max="100" value="${this.value}"></progress> 
      `
      : html`
        <div class="progress-indeterminate">
          <div class="indeterminate"></div>
        </div>
      ` ;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        .determinate, progress {
          width: 100%;
          border: none;
          height: var(--gap-tiny);
          display: block;
          appearance: none;
          -webkit-appearance: none;
        }
        .determinate, progress::-webkit-progress-bar, progress::-moz-progress-bar {
          background-color: var(--colors-primary-light);
        }
        .determinate, progress::-webkit-progress-value {
          background-color: var(--colors-foreground-light);
        }
        .progress-indeterminate {
          position: relative;
          height: var(--gap-tiny);
          display: block;
          width: 100%;
          background-color: var(--colors-foreground-light);
          border-radius: 2px;
          margin: 0.5rem 0 1rem 0;
          overflow: hidden;
        }
        .progress-indeterminate .indeterminate {
          background-color: var(--colors-primary-light);
        }
        .progress-indeterminate .indeterminate:before{
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }
        .progress-indeterminate .indeterminate:after {
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
          animation-delay: 1.15s;
        }
        @keyframes indeterminate {
          0% {
            left: -35%;
            right: 100%;
          }
          60% {
            left: 100%;
            right: -90%;
          }
          100% {
            left: 100%;
            right: -90%;
          }
        }

        @keyframes indeterminate-short {
          0% {
            left: -200%;
            right: 100%;
          }
          60% {
            left: 107%;
            right: -8%;
          }
          100% {
            left: 107%;
            right: -8%;
          }
        }
      `,
    ];

  }

}
