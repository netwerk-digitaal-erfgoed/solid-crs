import { MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectCreationComponent } from './object-creation.component';

describe('ObjectCreationComponent', () => {

  let component: ObjectCreationComponent;
  const tag = 'nde-object-creation';

  beforeEach(() => {

    component = window.document.createElement(tag) as ObjectCreationComponent;
    component.translator = new MockTranslator('nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
