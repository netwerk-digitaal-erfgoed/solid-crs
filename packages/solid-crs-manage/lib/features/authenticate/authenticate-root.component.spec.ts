/* eslint-disable @typescript-eslint/no-explicit-any */
import { define, hydrate } from '@digita-ai/dgt-components';
import { AuthenticateRootComponent } from './authenticate-root.component';

describe('AuthenticateRootComponent', () => {

  let component: AuthenticateRootComponent;

  beforeEach(() => {

    const solidService = ({} as any);

    const tag = 'authenticate-component';
    define(tag, hydrate(AuthenticateRootComponent)(solidService));
    component = window.document.createElement(tag) as AuthenticateRootComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

});
