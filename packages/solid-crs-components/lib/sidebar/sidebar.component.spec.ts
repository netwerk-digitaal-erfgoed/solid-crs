import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {

  let component = new SidebarComponent();

  beforeEach(() => {

    component = window.document.createElement('nde-sidebar') as SidebarComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should render', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body).toBeTruthy();

  });

  it('should add class inverse if inverse is set to true', async () => {

    component.inverse = true;
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('nde-sidebar')[0].shadowRoot.querySelectorAll('.inverse').length).toEqual(1);

  });

});
