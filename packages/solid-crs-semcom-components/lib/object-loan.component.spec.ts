import { MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectLoanComponent } from './object-loan.component';

describe('ObjectLoanComponent', () => {

  let component: ObjectLoanComponent;
  const tag = 'nde-object-representation';

  beforeEach(() => {

    component = window.document.createElement(tag) as ObjectLoanComponent;
    component.translator = new MockTranslator('nl-NL');

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
