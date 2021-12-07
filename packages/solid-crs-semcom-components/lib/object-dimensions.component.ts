import { html, property, unsafeCSS, css, TemplateResult, CSSResult, internalProperty } from 'lit-element';
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
  logger?: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  translator?: Translator;

  /**
   * The object to be displayed and/or edited.
   */
  @property({ type: Object })
  object?: CollectionObject;

  /**
   * The actor responsible for form validation in this component.
   */
  @property({ type: Object })
  formActor?: SpawnedActorRef<FormEvent>;

  /**
   * The possible values for lengths
   */
  @internalProperty()
  lengthUnits: Map<string, string> = new Map()
    .set('MMT', 'mm')
    .set('CMT', 'cm')
    .set('MTR', 'm');

  /**
   * The possible values for weights
   */
  @internalProperty()
  weightUnits: Map<string, string> = new Map()
    .set('KGM', 'kg')
    .set('GRM', 'g');

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.object ? html`

    <nde-large-card .showImage="${false}">
      <div slot="title">${this.translator?.translate('object.card.dimensions.title')}</div>
      <div slot="subtitle">${this.translator?.translate('object.card.dimensions.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(Connect)}
      </div>
      <div slot="content">
        <div class="dimension-field">
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="height">
            <label slot="label" for="height">${this.translator?.translate('object.card.dimensions.field.height.title')}</label>
            <input type="text" slot="input" name="height" id="height"/>
            <div slot="help" for="event">${this.translator?.translate('object.card.dimensions.field.height.description')}</div>
          </nde-form-element>
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="heightUnit">
            <label slot="label" for="height-unit" class="invisible">${this.translator?.translate('object.card.dimensions.field.unit.title')}</label>
            <select slot="input" name="height-unit" id="height-unit">
              ${Array.from(this.lengthUnits.keys()).map((unit) => html`<option id="${unit}" ?selected="${unit === this.object?.heightUnit}">${this.lengthUnits.get(unit)}</option>`)}
            </select>
          </nde-form-element>
        </div>
        <div class="dimension-field">
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="width">
            <label slot="label" for="width">${this.translator?.translate('object.card.dimensions.field.width.title')}</label>
            <input type="text" slot="input" name="width" id="width"/>
            <div slot="help" for="event">${this.translator?.translate('object.card.dimensions.field.width.description')}</div>
          </nde-form-element>
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="widthUnit">
            <label slot="label" for="width-unit" class="invisible">${this.translator?.translate('object.card.dimensions.field.unit.title')}</label>
            <select slot="input" name="width-unit" id="width-unit">
              ${Array.from(this.lengthUnits.keys()).map((unit) => html`<option id="${unit}" ?selected="${unit === this.object?.widthUnit}">${this.lengthUnits.get(unit)}</option>`)}
            </select>
          </nde-form-element>
        </div>
        <div class="dimension-field">
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="depth">
            <label slot="label" for="depth">${this.translator?.translate('object.card.dimensions.field.depth.title')}</label>
            <input type="text" slot="input" name="depth" id="depth"/>
            <div slot="help" for="event">${this.translator?.translate('object.card.dimensions.field.depth.description')}</div>
          </nde-form-element>
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="depthUnit">
            <label slot="label" for="depth-unit" class="invisible">${this.translator?.translate('object.card.dimensions.field.unit.title')}</label>
            <select slot="input" name="depth-unit" id="depth-unit">
              ${Array.from(this.lengthUnits.keys()).map((unit) => html`<option id="${unit}" ?selected="${unit === this.object?.depthUnit}">${this.lengthUnits.get(unit)}</option>`)}
            </select>
          </nde-form-element>
        </div>
        <div class="dimension-field">
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="weight">
            <label slot="label" for="weight">${this.translator?.translate('object.card.dimensions.field.weight.title')}</label>
            <input type="text" slot="input" name="weight" id="weight"/>
            <div slot="help" for="event">${this.translator?.translate('object.card.dimensions.field.weight.description')}</div>
          </nde-form-element>
          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="weightUnit">
            <label slot="label" for="weight-unit" class="invisible">${this.translator?.translate('object.card.dimensions.field.unit.title')}</label>
            <select slot="input" name="weight-unit" id="weight-unit">
              ${Array.from(this.weightUnits.keys()).map((unit) => html`<option id="${unit}" ?selected="${unit === this.object?.weightUnit}">${this.weightUnits.get(unit)}</option>`)}
            </select>
          </nde-form-element>
        </div>
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
          gap: var(--gap-large);
        }
        .dimension-field {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
        }
        .dimension-field nde-form-element:first-of-type {
          width: 100%;
        }
        .dimension-field nde-form-element:last-of-type {
          width: 7rem;
          min-width: 7rem;
          margin-left: var(--gap-normal);
        }
        /* not visible, but takes up space */
        .invisible {
          visibility: hidden;
        }
      `,
    ];

  }

}

export default ObjectDimensionsComponent;
