import { MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectDimensionsComponent } from './object-dimensions.component';

describe('ObjectDimensionsComponent', () => {

  let component: ObjectDimensionsComponent;
  const tag = 'nde-object-dimensions';

  beforeEach(() => {

    component = window.document.createElement(tag) as ObjectDimensionsComponent;
    component.translator = new MockTranslator('nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
