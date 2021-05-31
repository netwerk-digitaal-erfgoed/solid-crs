import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Interpreter, SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Object as ObjectIcon } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { from } from 'rxjs';
import { ObjectContext, ObjectStates } from '../object.machine';
import { ObjectEvents } from '../object.events';

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

    const editing = this.state?.matches(ObjectStates.EDITING);

    const initializeFormMachine = () => { if (!editing) { this.actor.send(ObjectEvents.CLICKED_EDIT); } };

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
          <input type="text" slot="input" name="creator" value="${this.object.creator}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="locationCreated">
          <label slot="label" for="locationCreated">${this.translator?.translate('nde.features.object.card.creation.field.location')}</label>
          <input type="text" slot="input" name="locationCreated" value="${this.object.locationCreated}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="material">
          <label slot="label" for="material">${this.translator?.translate('nde.features.object.card.creation.field.material')}</label>
          <input type="text" slot="input" name="material" value="${this.object.material}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="dateCreated">
          <label slot="label" for="dateCreated">${this.translator?.translate('nde.features.object.card.creation.field.date')}</label>
          <input type="text" slot="input" name="dateCreated" value="${this.object.dateCreated}" @click="${initializeFormMachine}"/>
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
