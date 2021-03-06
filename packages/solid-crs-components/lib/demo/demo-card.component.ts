/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { css, CSSResult, html, LitElement, TemplateResult } from 'lit-element';
import fetchMock from 'jest-fetch-mock';

export class DemoNDECardComponent extends LitElement {

  render(): TemplateResult {

    const translator = new MemoryTranslator('nl-NL',);

    fetchMock.mockResponseOnce(JSON.stringify({
      'common': {
        'date': {
          'just-now': 'enkele ogenblikken geleden',
          'minutes-ago': 'minuten geleden',
          'hour-ago': 'uur geleden',
          'hours-ago': 'uur geleden',
          'day-ago': 'dag geleden',
          'days-ago': 'dagen geleden',
          'month-ago': 'maand geleden',
          'months-ago': 'maanden geleden',
          'year-ago': 'jaar geleden',
          'years-ago': 'jaar geleden',
        },
      },
      'collections': {
        'card': {
          'name-unavailable': 'Naam onbekend',
          'subject-unavailable': 'Onderwerp onbekend',
        },
      },
    }));

    const obj1 = {
      uri: 'nl',
      name: 'Object nummer 1',
      description: 'Een object',
      image: 'https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80',
      subject: [ { name: 'Wel Degelijk Geen Molen' } ],
      type: 'type',
      updated: '1620216600000',
      collection: undefined,
    } as any;

    const obj2 = { ...obj1, name: undefined } as any;
    const obj3 = { ...obj2, subject: undefined } as any;
    const obj4 = { ...obj3, updated: undefined } as any;
    const obj5 = { ...obj4, image: undefined } as any;

    const col1 = {
      name: 'Collectie nummer 1',
      description: 'Beschrijving eerste collectie',
    } as Collection;

    const col2 = { ...col1, name: undefined } as any;
    const col3 = { ...col2, description: undefined } as any;

    return html`
      <p>Collection Objects</p>
      <div class='grid'>
        <nde-object-card .translator=${translator} .object=${obj1}
        ></nde-object-card>
        <nde-object-card .translator=${translator} .object=${obj2}
        ></nde-object-card>
        <nde-object-card .translator=${translator} .object=${obj3}
        ></nde-object-card>
        <nde-object-card .translator=${translator} .object=${obj4}
        ></nde-object-card>
        <nde-object-card .translator=${translator} .object=${obj1}
        ></nde-object-card>
        <nde-object-card .translator=${translator} .object=${obj5}
        ></nde-object-card>
      </div>

      <p>Collections</p>
      <div class='grid'>
        <nde-collection-card .translator=${translator} .collection=${col1}
        ></nde-collection-card>
        <nde-collection-card .translator=${translator} .collection=${col2}
        ></nde-collection-card>
        <nde-collection-card .translator=${translator} .collection=${col3}
        ></nde-collection-card>
        <nde-collection-card .translator=${translator} .collection=${col1}
        ></nde-collection-card>
      </div>
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [ css`
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-gap: var(--gap-normal);
      }
      nde-object-card, nde-collection-card {
        height: 227px;
      }
    ` ];

  }

}

export default DemoNDECardComponent;
