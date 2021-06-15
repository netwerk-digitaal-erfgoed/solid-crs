import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { SpawnedActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Object as ObjectIcon } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * The root page of the object feature.
 */
export class ObjectCreationComponent extends RxLitElement {

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
      <div slot="title">${this.translator?.translate('nde.features.object.card.creation.title')}</div>
      <div slot="subtitle">${this.translator?.translate('nde.features.object.card.creation.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(ObjectIcon)}
      </div>
      <div slot="content">
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="creator">
          <label slot="label" for="creator">${this.translator?.translate('nde.features.object.card.creation.field.creator')}</label>
          <input type="text" slot="input" name="creator" id="creator"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="locationCreated">
          <label slot="label" for="locationCreated">${this.translator?.translate('nde.features.object.card.creation.field.location')}</label>
          <input type="text" slot="input" name="locationCreated" id="locationCreated"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="material">
          <label slot="label" for="material">${this.translator?.translate('nde.features.object.card.creation.field.material')}</label>
          <input type="text" slot="input" name="material" id="material"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="dateCreated">
          <label slot="label" for="dateCreated">${this.translator?.translate('nde.features.object.card.creation.field.date')}</label>
          <input type="text" slot="input" name="dateCreated" id="dateCreated" placeholder="YYYY-MM-DD"/>
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

export default ObjectCreationComponent;
