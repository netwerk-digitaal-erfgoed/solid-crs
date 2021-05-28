import { Collection, CollectionObject, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { css, html, LitElement } from 'lit-element';

export class DemoNDECardComponent extends LitElement {

  render() {

    const translator = new MemoryTranslator(
      [
        {
          key: 'nde.common.date.just-now',
          locale: 'nl-NL',
          value: 'enkele ogenblikken geleden',
        },
        {
          key: 'nde.common.date.minutes-ago',
          locale: 'nl-NL',
          value: 'minuten geleden',
        },
        {
          key: 'nde.common.date.hour-ago',
          locale: 'nl-NL',
          value: 'uur geleden',
        },
        {
          key: 'nde.common.date.hours-ago',
          locale: 'nl-NL',
          value: 'uur geleden',
        },
        {
          key: 'nde.common.date.day-ago',
          locale: 'nl-NL',
          value: 'dag geleden',
        },
        {
          key: 'nde.common.date.days-ago',
          locale: 'nl-NL',
          value: 'dagen geleden',
        },
        {
          key: 'nde.common.date.month-ago',
          locale: 'nl-NL',
          value: 'maand geleden',
        },
        {
          key: 'nde.common.date.months-ago',
          locale: 'nl-NL',
          value: 'maanden geleden',
        },
        {
          key: 'nde.common.date.year-ago',
          locale: 'nl-NL',
          value: 'jaar geleden',
        },
        {
          key: 'nde.common.date.years-ago',
          locale: 'nl-NL',
          value: 'jaar geleden',
        },
        {
          key: 'nde.features.collections.card.name-unavailable',
          locale: 'nl-NL',
          value: 'Naam onbekend',
        },
        {
          key: 'nde.features.collections.card.subject-unavailable',
          locale: 'nl-NL',
          value: 'Onderwerp onbekend',
        },
      ],
      'nl-NL',
    );

    const obj1 = {
      uri: 'nde.nl',
      name: 'Object nummertje 1',
      description: 'Een object',
      image: 'https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80',
      subject: 'Wel Degelijk Geen Molen',
      type: 'type',
      updated: '1620216600000',
      collection: undefined,
    } as CollectionObject;

    const obj2 = { ...obj1, name: undefined } as CollectionObject;
    const obj3 = { ...obj2, subject: undefined } as CollectionObject;
    const obj4 = { ...obj3, updated: undefined } as CollectionObject;
    const obj5 = { ...obj4, image: undefined } as CollectionObject;

    const col1 = {
      name: 'Collectie nummertje 1',
      description: 'Beschrijving eerste collectie',
    } as Collection;

    const col2 = { ...col1, name: undefined } as Collection;
    const col3 = { ...col2, description: undefined } as Collection;

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
  static get styles() {

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
