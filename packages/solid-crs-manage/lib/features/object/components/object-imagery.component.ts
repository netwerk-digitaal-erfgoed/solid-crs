import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Interpreter, SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Image } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { from } from 'rxjs';
import { ObjectContext } from '../object.machine';

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
  @internalProperty()
  object?: CollectionObject;

  /**
   * The actor responsible for form validation in this component.
   */
  @property()
  formActor: SpawnedActorRef<FormEvent>;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<ObjectContext>;

  /**
   * The state of the actor.
   */
  @internalProperty()
  state?: State<ObjectContext>;

  /**
   * A list of licenses
   */
  @internalProperty()
  licenses?: { name: string; uri: string }[] = [
    {
      name: 'CC0 1.0',
      uri: 'https://creativecommons.org/publicdomain/zero/1.0/deed.nl',
    },
    {
      name: 'CC BY 4.0',
      uri: 'https://creativecommons.org/licenses/by/4.0/deed.nl',
    },
    {
      name: 'CC BY-SA 2.0',
      uri: 'https://creativecommons.org/licenses/by-sa/2.0/be/deed.nl',
    },
  ];

  /**
   * Hook called on at every update after connection to the DOM.
   */
  firstUpdated(changed: PropertyValues): void {

    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor));

  }

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
          <label slot="label" for="image">${this.translator?.translate('nde.features.object.card.image.field.file')}</label>
          <input type="text" slot="input" name="image"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="license">
          <label slot="label" for="license">${this.translator?.translate('nde.features.object.card.image.field.license')}</label>
          <select slot="input" name="license">
            ${this.licenses.map((license) => html`<option id="${license.uri}" ?selected="${license.uri === this.object.license}">${license.name}</option>`)}
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
