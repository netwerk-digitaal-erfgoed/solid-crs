import { SidebarListComponent } from './sidebar-list.component';
import { SidebarListItemComponent } from './sidebar-list-item.component';

describe('SidebarListComponent', () => {

  let component = new SidebarListComponent();

  let firstListItem: SidebarListItemComponent;
  let secondListItem: SidebarListItemComponent;
  let thirdListItem: SidebarListItemComponent;

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  beforeEach(() => {

    component = window.document.createElement('nde-sidebar-list') as SidebarListComponent;

    firstListItem = window.document.createElement('nde-sidebar-list-item') as SidebarListItemComponent;
    firstListItem.setAttribute('selected', '');
    firstListItem.setAttribute('slot', 'item');
    secondListItem = window.document.createElement('nde-sidebar-list-item') as SidebarListItemComponent;
    firstListItem.setAttribute('slot', 'item');
    thirdListItem = window.document.createElement('nde-sidebar-list-item') as SidebarListItemComponent;
    firstListItem.setAttribute('slot', 'item');
    component.appendChild(firstListItem);
    component.appendChild(secondListItem);
    component.appendChild(thirdListItem);

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should set selected when item is clicked', async () => {

    const event = document.createEvent('MouseEvent');
    const el = document.createElement('nde-sidebar-list-item') as HTMLSlotElement;
    el.name = 'item';

    expect(el.hasAttribute('selected')).toBeFalsy();

    const selectSpy = spyOn(component, 'select').and.callThrough();

    window.document.body.appendChild(component);
    await component.updateComplete;

    event.composedPath = jest.fn(() => [ el ]);
    component.select(event);

    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(el.hasAttribute('selected')).toBeTruthy();

  });

  it('should not set selected when title is clicked', async () => {

    const event = document.createEvent('MouseEvent');
    const el = document.createElement('nde-sidebar-list-item') as HTMLSlotElement;
    el.name = 'title';

    expect(el.hasAttribute('selected')).toBeFalsy();

    const selectSpy = spyOn(component, 'select').and.callThrough();

    window.document.body.appendChild(component);
    await component.updateComplete;

    event.composedPath = jest.fn(() => [ el ]);
    component.select(event);

    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(el.hasAttribute('selected')).toBeFalsy();

  });

  it('should call select when select is clicked', async () => {

    const selectSpy = spyOn(component, 'select');

    window.document.body.appendChild(component);
    await component.updateComplete;

    const select = window.document.body.getElementsByTagName('nde-sidebar-list')[0].shadowRoot.querySelector('slot[name="item"]') as HTMLElement;
    select.click();

    expect(selectSpy).toHaveBeenCalledTimes(1);

  });

});
