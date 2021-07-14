import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { SpawnedActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Image } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * The root page of the object feature.
 */
export class ObjectImageryComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The object to be displayed and/or edited.
   */
  @property()
  object?: CollectionObject;

  /**
   * The actor responsible for form validation in this component.
   */
  @property()
  formActor: SpawnedActorRef<FormEvent>;

  /**
   * A list of licenses
   */
  @property()
  licenses: string[] = [
    'http://rightsstatements.org/vocab/InC/1.0/',
    'http://rightsstatements.org/vocab/InC-OW-EU/1.0/',
    'http://rightsstatements.org/vocab/InC-EDU/1.0/',
    'http://rightsstatements.org/vocab/InC-NC/1.0/',
    'http://rightsstatements.org/vocab/InC-RUU/1.0/',
    'http://rightsstatements.org/vocab/NoC-US/1.0/',
    'http://rightsstatements.org/vocab/NoC-OKLR/1.0/',
    'http://rightsstatements.org/vocab/NoC-CR/1.0/',
    'http://rightsstatements.org/vocab/NoC-NC/1.0/',
    'http://rightsstatements.org/vocab/UND/1.0/',
    'http://rightsstatements.org/vocab/CNE/1.0/',
    'http://rightsstatements.org/vocab/NKC/1.0/',
    'https://creativecommons.org/publicdomain/zero/1.0/deed.nl',
    'https://creativecommons.org/licenses/by/4.0/deed.nl',
    'https://creativecommons.org/licenses/by-sa/2.0/be/deed.nl',
  ];

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.object ? html`
        
    <nde-large-card>
      <div slot="title">${this.translator?.translate('nde.features.object.card.image.title')}</div>
      <div slot="subtitle">${this.translator?.translate('nde.features.object.card.image.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(Image)}
      </div>
      <img slot="image" src="${this.object.image}">
      <div slot="content">
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="image">
          <label slot="label" for="image">${this.translator?.translate('nde.features.object.card.field.file')}</label>
          <input type="text" slot="input" name="image" id="image"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="license">
          <label slot="label" for="license">${this.translator?.translate('nde.features.object.card.field.license')}</label>
          <select slot="input" name="license" id="license">
            ${this.licenses.map((license: string) => html`<option id="${license}" ?selected="${license === this.object.license}">${this.translator?.translate(`nde.features.object.card.image.field.license.${license}`)}</option>`)}
          </select>
        </nde-form-element>
      </div>
    </nde-large-card>
  ` : html``;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        nde-large-card div[slot="content"] {
          display: flex;
          flex-direction: column;
          gap: var(--gap-normal);
        }
      `,
    ];

  }

}

export default ObjectImageryComponent;
