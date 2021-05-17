import { ArgumentError, Collection, MemoryTranslator } from '@digita-ai/nde-erfgoed-core';
import { CollectionCardComponent } from './collection-card.component';

describe('AlertComponent', () => {

  let component: CollectionCardComponent;
  const tag = 'nde-collection-card';

  const testCollection = {
    uri: 'Test Uri Collection',
    name: 'Test Collection',
    description: 'Collection Test Description',
  } as Collection;

  beforeEach(() => {

    component = window.document.createElement('nde-collection-card') as CollectionCardComponent;

    component.translator = new MemoryTranslator([
      {
        key: 'nde.features.collections.card.name-unavailable',
        value:'Name unavailable',
        locale:'en-GB',
      },
    ], 'en-GB');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should display name and description of the collection', async () => {

    component.collection = testCollection;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html).toContain(testCollection.name);
    expect(html).toContain(testCollection.description);

  });

  it('should display no description when the collection does not have a description', async () => {

    component.collection = { ...testCollection, description: undefined };
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html).toContain(testCollection.name);
    expect(html).not.toContain(testCollection.description);

  });

  it('should display a message when the collection does not have a name', async () => {

    component.collection = { ...testCollection, name: undefined };
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html).not.toContain(testCollection.name);
    expect(html).toContain('Name unavailable');
    expect(html).toContain(testCollection.description);

  });

  it('should display no description and a message when the collection is null', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html).not.toContain(testCollection.name);
    expect(html).not.toContain(testCollection.description);
    expect(html).toContain('Name unavailable');

  });

});
