import { Cross, Dropdown, Search, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { html, unsafeCSS, css, TemplateResult, CSSResult, property, query, internalProperty, PropertyValues } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { ActorRef, Interpreter } from 'xstate';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { FormActors, FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { TermSource, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ClickedSubmitEvent, QueryUpdatedEvent } from './term.events';
import { TermContext } from './term.machine';

/**
 * The root page of the object feature.
 */
export class TermSearchComponent extends RxLitElement {

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<TermContext>;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  formActor: ActorRef<FormEvent>;

  /**
   * The field that for which Terms are being edited
   */
  @internalProperty()
  field: string;

  /**
   * A list of all sources
   */
  @internalProperty()
  sources: TermSource[];

  /**
   * The input element of the search form
   */
  @query('nde-form-element input')
  public searchInput: HTMLInputElement;

  /**
   * Hook called on every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed.has('actor') && this.actor) {

      this.subscribe('field', from(this.actor).pipe(
        map((state) => state.context?.field),
      ));

      this.subscribe('sources', from(this.actor).pipe(
        map((state) => state.context?.sources),
      ));

      this.subscribe('formActor', from(this.actor).pipe(
        map((state) => state.children[FormActors.FORM_MACHINE]),
      ));

    }

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.sources ? html`
      <form class="search-form" onsubmit="return false">
          <nde-form-element class="term" .actor="${this.formActor}" field="query" .submitOnEnter="${false}">
            <label slot="label" for="example">${this.field}</label>
            <input 
              type="text"
              slot="input"
              name="${this.field}"
              class="query"
              @input="${() => this.actor.send(new QueryUpdatedEvent(this.searchInput?.value, []))}"
            />
            ${this.searchInput?.value.length > 0
    ? html`<div class="cross" slot="icon" @click="${() => { this.searchInput.value = ''; }}">${ unsafeSVG(Cross) }</div>`
    : html`<div slot="icon">${ unsafeSVG(Search) }</div>`
}
          </nde-form-element>

          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="sources">
            <div slot="icon">${ unsafeSVG(Dropdown) }</div>
            <ul slot="input" >
              <li>
                <label for="title"></label>
              </li>
              ${ this.sources.map((source) => html`
                <li>
                  <input type="checkbox" id="${source.uri}" name="${source.uri}">
                  <label for="${source.uri}">${source.name}</label>
                </li>
              `)}
            </ul>
          </nde-form-element>

          <button type="button" @click="${() => this.actor.send(new ClickedSubmitEvent())}">Bevestig</button>
        </form>  
    ` : html`<nde-progress-bar></nde-progress-bar>`;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          margin: var(--gap-large);
          width: 100%;
        }
        nde-progress-bar {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
        }
        form.search-form {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: space-between;
        }
        nde-form-element {
          margin: 0;
        }
      `,
    ];

  }

}

export default TermSearchComponent;
