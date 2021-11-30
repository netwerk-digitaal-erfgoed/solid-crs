import { MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectImageryComponent } from './object-imagery.component';

describe('ObjectImageryComponent', () => {

  let component: ObjectImageryComponent;
  const tag = 'nde-object-imagery';

  beforeEach(() => {

    component = window.document.createElement(tag) as ObjectImageryComponent;
    component.translator = new MockTranslator('nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
