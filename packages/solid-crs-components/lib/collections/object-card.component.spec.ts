import { CollectionObject, MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectCardComponent } from './object-card.component';

describe('ObjectCardComponent', () => {

  let component: ObjectCardComponent;
  const tag = 'nde-object-card';

  const testObject = {
    uri: 'test uri',
    name: 'test name',
    description: 'test description',
    additionalType: [ { uri: '', name: 'test additionalType' } ],
    image: 'https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80',
    updated: new Date().getTime().toString(),
    type: '',
    collection: 'uri',
  } as CollectionObject;

  beforeEach(() => {

    component = window.document.createElement('nde-object-card') as ObjectCardComponent;

    component.translator = new MemoryTranslator([
      {
        key: 'nde.collections.card.name-unavailable',
        value:'Name unavailable',
        locale:'en-GB',
      },
      {
        key: 'nde.collections.card.additionalType-unavailable',
        value:'Type unavailable',
        locale:'en-GB',
      },
      {
        key: 'nde.common.date.just-now',
        value:'Just Now',
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

  it('should display name, additionalType and time ago of the object', async () => {

    component.object = testObject;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html).toContain(testObject.name);
    expect(html).toContain(testObject.additionalType[0].name);
    expect(html).not.toContain('Name unavailable');
    expect(html).not.toContain('Type unavailable');
    expect(html).toContain('- Just Now');

  });

  it('should display message when name of the object is undefined', async () => {

    component.object = { ...testObject, name: undefined };
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html).not.toContain(testObject.name);
    expect(html).toContain('Name unavailable');
    expect(html).toContain(testObject.additionalType[0].name);
    expect(html).not.toContain('Type unavailable');
    expect(html).toContain('- Just Now');

  });

  it('should display message when additionalType of the object is empty list', async () => {

    component.object = { ...testObject, additionalType: [] };
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;
    expect(html).toContain(testObject.name);
    expect(html).not.toContain('Name unavailable');
    expect(html).not.toContain(testObject.additionalType[0].name);
    expect(html).toContain('Type unavailable');
    expect(html).toContain('- Just Now');

  });

  it('should not display time ago when updated of the object is undefined', async () => {

    component.object = { ...testObject, updated: undefined };
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html).toContain(testObject.name);
    expect(html).not.toContain('Name unavailable');
    expect(html).toContain(testObject.additionalType[0].name);
    expect(html).not.toContain('Type unavailable');
    expect(html).not.toContain('- Just Now');

  });

  it('should display the image of the object', async () => {

    component.object = testObject;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html.split('amp;').join('')).toContain(testObject.image);

  });

  it('should not display the image of the object', async () => {

    component.object = { ...testObject, image: undefined };
    window.document.body.appendChild(component);
    await component.updateComplete;

    const html = window.document.body.getElementsByTagName(tag)[0].shadowRoot.innerHTML;

    expect(html.split('amp;').join('')).not.toContain(testObject.image);

  });

});
