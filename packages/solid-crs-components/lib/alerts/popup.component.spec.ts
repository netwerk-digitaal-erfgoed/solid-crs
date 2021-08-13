import { PopupComponent } from './popup.component';

describe('PopupComponent', () => {

  let component: PopupComponent;

  beforeEach(() => {

    component = window.document.createElement('nde-popup') as PopupComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should add correct class when this.dark is set', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const div = window.document.body.getElementsByTagName('nde-popup')[0].shadowRoot.querySelector<HTMLDivElement>('div.overlay');
    expect(div.className).not.toMatch('dark');

    component.dark = true;
    await component.updateComplete;
    expect(div.className).toMatch('dark');

  });

  it('should hide the component when the background is clicked', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.show();
    expect(component.hidden).toBeFalsy();

    const div = window.document.body.getElementsByTagName('nde-popup')[0].shadowRoot.querySelector<HTMLDivElement>('div.overlay');
    div.click();

    await component.updateComplete;
    expect(component.hidden).toBeTruthy();

  });

  it('should not hide the component when the content is clicked', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    component.show();
    expect(component.hidden).toBeFalsy();

    const content = window.document.body.getElementsByTagName('nde-popup')[0].shadowRoot.querySelector<HTMLSlotElement>('slot');
    content.click();

    await component.updateComplete;
    expect(component.hidden).toBeFalsy();

  });

  describe('toggle', () => {

    it('should toggle this.hidden', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

      expect(component.hidden).toEqual(true);
      component.toggle();
      expect(component.hidden).toEqual(false);
      component.toggle();
      expect(component.hidden).toEqual(true);

    });

  });

});
