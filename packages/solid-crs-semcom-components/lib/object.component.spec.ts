import { MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { RxLitElement } from 'rx-lit';

describe.each([
  [ 'ObjectCreationComponent', 'nde-object-creation' ],
  [ 'ObjectDimensionsComponent', 'nde-object-dimensions' ],
  [ 'ObjectIdentificationComponent', 'nde-object-identification' ],
  [ 'ObjectImageryComponent', 'nde-object-imagery' ],
  [ 'ObjectRepresentationComponent', 'nde-object-representation' ],
])('%s', (name, tag) => {

  let component: RxLitElement;

  const collection1 = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: '',
    distribution: '',
  };

  const object1 = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: '1',
    collection: 'collection-uri-1',
  };

  beforeEach(() => {

    component = window.document.createElement(tag) as RxLitElement;
    (component as any).object = object1;
    (component as any).translator = new MemoryTranslator([], 'nl-NL');
    (component as any).collections = [ collection1 ];

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should render when object is set', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const root = window.document.body.querySelector(tag);
    expect(root).toBeTruthy();
    expect(root.shadowRoot.querySelector('nde-large-card')).toBeTruthy();

  });

  it('should not render anything when object is undefined', async () => {

    (component as any).object = undefined;
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.querySelector(tag)).toBeTruthy();
    expect(window.document.body.querySelector('nde-large-card')).toBeFalsy();

  });

});
