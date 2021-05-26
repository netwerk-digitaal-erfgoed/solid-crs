import { css, html, LitElement } from 'lit-element';
import { Collection as CollectionIcon, Image } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

export class DemoLargeCardComponent extends LitElement {

  render() {

    return html`
      <nde-large-card>
        <span slot="title">Beeldmateriaal</span>
        <span slot="subtitle">Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel Dit is een ondertitel</span>
        <div slot="icon">
          ${unsafeSVG(Image)}
        </div>
        <img slot="image" src="https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80">
        <div slot="content">
          <nde-demo-form></nde-demo-form>
        </div>
      </nde-large-card>

      <p></p>

      <nde-large-card .showImage="${false}">
        <span slot="title">Zonder image deze keer</span>
        <span slot="subtitle">Dit is een ondertitel</span>
        <div slot="icon">
          ${unsafeSVG(CollectionIcon)}
        </div>
        <div slot="content">
          <nde-demo-form></nde-demo-form>
        </div>
      </nde-large-card>

      <p></p>

      <nde-large-card .showContent="${false}">
        <span slot="title">Zonder content deze keer</span>
        <span slot="subtitle">Dit is een ondertitel</span>
        <div slot="icon">
          ${unsafeSVG(CollectionIcon)}
        </div>
        <img slot="image" src="https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80">
      </nde-large-card>
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [ css`` ];

  }

}

export default DemoLargeCardComponent;
