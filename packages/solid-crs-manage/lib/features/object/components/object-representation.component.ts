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
export class ObjectRepresentationComponent extends RxLitElement {

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
      <div slot="title">${this.translator?.translate('nde.features.object.card.representation.title')}</div>
      <div slot="subtitle">${this.translator?.translate('nde.features.object.card.representation.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(ObjectIcon)}
      </div>
      <div slot="content">
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="subject">
          <label slot="label" for="subject">${this.translator?.translate('nde.features.object.card.representation.field.subject')}</label>
          <input type="text" slot="input" name="subject" value="${this.object.subject}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="location">
          <label slot="label" for="location">${this.translator?.translate('nde.features.object.card.representation.field.location')}</label>
          <input type="text" slot="input" name="location" value="${this.object.location}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="person">
          <label slot="label" for="person">${this.translator?.translate('nde.features.object.card.representation.field.person')}</label>
          <input type="text" slot="input" name="person" value="${this.object.person}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="organization">
          <label slot="label" for="organization">${this.translator?.translate('nde.features.object.card.representation.field.organization')}</label>
          <input type="text" slot="input" name="organization" value="${this.object.organization}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="event">
          <label slot="label" for="event">${this.translator?.translate('nde.features.object.card.representation.field.event')}</label>
          <input type="text" slot="input" name="event" value="${this.object.event}" @click="${initializeFormMachine}"/>
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
