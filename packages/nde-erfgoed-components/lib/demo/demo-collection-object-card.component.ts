import { MemoryTranslator } from '@digita-ai/nde-erfgoed-core';
import { css, html, LitElement } from 'lit-element';

export class DemoCollectionObjectCardComponent extends LitElement {
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
      ],
      'nl-NL',
    );
    const mandje = {
      'uri': 'nde.nl',
      'name': 'Mandje Van Tichelaar',
      'description': 'Een heel mooi mandje gemaakt door de firma Tichelaar. Het werd gebruikt op tafel als versiering en fruitmandje.',
      'image': 'https://i.ytimg.com/vi/ypSKDY4Jp3g/maxresdefault.jpg',
      'subject': 'Tafeldecoratie',
      'type': 'type',
      'updated': 1620216600000,
    };
    const screenshot = {
      'uri': '',
      'name': 'Random screenshot van het internet',
      'description': '',
      'image': 'https://i.pinimg.com/236x/2e/00/d6/2e00d61127764e2f4313f76b08b56160.jpg',
      'subject': 'Screenshot',
      'type': 'type',
      'updated': 1620018600000,
    };
    return html`
      <div style='display: flex; justify-content: space-evenly;'>
        <div style='width: 400px; height: 300px;'>
          <nde-collection-object-card .translator=${translator} .object=${mandje}
          ></nde-collection-object-card>
        </div>
        <div style='width: 400px; height: 700px;'>
          <nde-collection-object-card .translator=${translator} .object=${screenshot}
          ></nde-collection-object-card>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [ css`` ];
  }
}

export default DemoCollectionObjectCardComponent;
