import { html, property, PropertyValues, internalProperty, unsafeCSS, css } from 'lit-element';
import { Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Event, FormActors, FormRootStates, FormSubmissionStates, FormCleanlinessStates, FormValidationStates, FormEvents } from '@digita-ai/nde-erfgoed-components';
import { ActorRef, Interpreter, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, NdeLogoInverse, Theme } from '@digita-ai/nde-erfgoed-theme';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { AuthenticateContext } from './authenticate.machine';

/**
 * The root page of the authenticate feature.
 */
export class AuthenticateRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
  public actor: Interpreter<AuthenticateContext>;

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  formActor: ActorRef<Event<FormEvents>>;

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<AuthenticateContext>;

  /**
   * The state of this component.
   */
  @internalProperty()
  enableSubmit?: boolean;

  /**
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  updated(changed: PropertyValues) {
    super.updated(changed);

    if(changed.has('actor')){
      this.subscribe('formActor', from(this.actor).pipe(
        map((state) => state.children[FormActors.FORM_MACHINE]),
      ));
    }

    if(changed.has('formActor')){
      this.subscribe('enableSubmit', from(this.formActor).pipe(
        map((state) => state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
            [FormRootStates.VALIDATION]: FormValidationStates.VALID,
          },
        })),
      ));
    }
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return this.formActor ? html`
      <div class="title-container">
        ${ unsafeSVG(NdeLogoInverse) }
        <h1>${this.translator.translate('nde.features.authenticate.pages.login.title')}</h1>
      </div>
      <div class="form-container">
        <form>
          <nde-form-element .inverse="${true}" .actor="${this.formActor}" .translator="${this.translator}" field="webId">
            <div slot="icon"></div>
            <input type="text" slot="input" placeholder="${this.translator.translate('nde.features.authenticate.pages.login.search-placeholder')}" />
            <button slot="action" class="primary" ?disabled="${!this.enableSubmit}" @click="${() => this.formActor.send(FormEvents.FORM_SUBMITTED)}">${ unsafeSVG(Login) }</button>
          </nde-form-element>
        </form>
      </div>
      <div></div>
    ` : html``;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
      css`
        :host {
          width: 400px;
          height: 100%;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        .title-container {
          margin-top: 30vh; 
          max-height: 50px;
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          color: var(--colors-foreground-inverse);
        }
        
        .title-container svg {
          max-height: 50px;
          height: 50px;
          max-width: 50px;
          width: 50px;
          fill: var(--colors-foreground-inverse);
        }

        .title-container h1 {
          font-size: var(--font-size-header-normal);
          font-weight: normal;
        }
      `,
    ];
  }

}
