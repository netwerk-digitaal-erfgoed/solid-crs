import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { SpawnedActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Connect } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * The root page of the object feature.
 */
export class ObjectDimensionsComponent extends RxLitElement {

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
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.object ? html`

    <nde-large-card .showImage="${false}">
      <div slot="title">${this.translator?.translate('nde.features.object.card.dimensions.title')}</div>
      <div slot="subtitle">${this.translator?.translate('nde.features.object.card.dimensions.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(Connect)}
      </div>
      <div slot="content">
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="depth">
          <label slot="label" for="depth">${this.translator?.translate('nde.features.object.card.dimensions.field.depth')}</label>
          <input type="text" slot="input" name="depth"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="width">
          <label slot="label" for="width">${this.translator?.translate('nde.features.object.card.dimensions.field.width')}</label>
          <input type="text" slot="input" name="width"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="height">
          <label slot="label" for="height">${this.translator?.translate('nde.features.object.card.dimensions.field.height')}</label>
          <input type="text" slot="input" name="height"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="weight">
          <label slot="label" for="weight">${this.translator?.translate('nde.features.object.card.dimensions.field.weight')}</label>
          <input type="text" slot="input" name="weight"/>
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

export default ObjectDimensionsComponent;
