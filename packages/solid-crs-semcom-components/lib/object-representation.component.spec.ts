import { MemoryTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectRepresentationComponent } from './object-representation.component';

describe('ObjectRepresentationComponent', () => {

  let component: ObjectRepresentationComponent;
  const tag = 'nde-object-representation';

  beforeEach(() => {

    component = window.document.createElement(tag) as ObjectRepresentationComponent;
    component.translator = new MemoryTranslator('nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
