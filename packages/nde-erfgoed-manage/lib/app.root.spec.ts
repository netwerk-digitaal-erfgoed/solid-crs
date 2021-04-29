import { AppRootComponent } from './app.root';

describe('AppRootComponent', () => {
  let component: AppRootComponent;

  beforeEach(() => {
    component = window.document.createElement('nde-app-root') as AppRootComponent;
  });

  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should be correctly instantiated', () => {
    expect(component).toBeTruthy();
  });
});
