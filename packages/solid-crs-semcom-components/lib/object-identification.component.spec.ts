import { MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectIdentificationComponent } from './object-identification.component';

describe('ObjectIdentificationComponent', () => {

  let component: ObjectIdentificationComponent;
  const tag = 'nde-object-identification';

  beforeEach(() => {

    component = window.document.createElement(tag) as ObjectIdentificationComponent;
    component.translator = new MockTranslator('nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
