import { ContentHeaderComponent } from './content-header.component';

describe('ContentHeaderComponent', () => {

  let component: ContentHeaderComponent;

  beforeEach(() => {

    component = window.document.createElement('nde-content-header') as ContentHeaderComponent;

    const title = window.document.createElement('div');
    title.innerHTML = 'Foo';
    title.slot = 'title';
    component.appendChild(title);

    const subtitle = window.document.createElement('div');
    subtitle.innerHTML = 'Bar';
    subtitle.slot = 'subtitle';
    component.appendChild(subtitle);

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show title and subtitle', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    const titleSlot = window.document.body.getElementsByTagName('nde-content-header')[0].shadowRoot.querySelector<HTMLSlotElement>('slot[name="title"]');
    expect(titleSlot.assignedElements()[0].innerHTML).toEqual('Foo');

    const subtitleSlot = window.document.body.getElementsByTagName('nde-content-header')[0].shadowRoot.querySelector<HTMLSlotElement>('slot[name="subtitle"]');
    expect(subtitleSlot.assignedElements()[0].innerHTML).toEqual('Bar');

  });

  it.each([ true, false ])('should show set inverse class', async (inverse) => {

    component.inverse = inverse;

    window.document.body.appendChild(component);
    await component.updateComplete;

    if(inverse) {

      expect(window.document.body.getElementsByTagName('nde-content-header')[0].shadowRoot.querySelector('.header.inverse')).toBeFalsy();

    } else {

      expect(window.document.body.getElementsByTagName('nde-content-header')[0].shadowRoot.querySelector('.header.inverse')).toBeTruthy();

    }

  });

});
