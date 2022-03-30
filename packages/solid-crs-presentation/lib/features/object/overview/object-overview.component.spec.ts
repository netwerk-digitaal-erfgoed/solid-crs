import { LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { mockCollection1, mockCollection2, mockObject1, mockObjectEmpty, mockObjectMinimal } from '../../../../tests/test-data';
import { ObjectOverviewComponent } from './object-overview.component';

describe('ObjectOverviewComponent', () => {

  let component: ObjectOverviewComponent;

  beforeEach(async () => {

    const mockActor = new Promise((resolve) => resolve({
      send: jest.fn(),
      context: {
        collections: [ mockCollection1, mockCollection2 ],
        object: mockObject1,
      },
    })) as any;

    component = window.document.createElement('nde-object-overview') as ObjectOverviewComponent;
    component.translator = new MockTranslator('nl-NL');
    component.actor = mockActor;
    await component.updated(new Map().set('actor', mockActor));

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';
    jest.restoreAllMocks();
    component = undefined;

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should not throw when running updated with null', () => {

    expect(() => component.updated(null)).not.toThrow();

  });

  describe('onClickedCopy', () => {

    it('should copy value to clipboard when onClickedCopy is fired', async () => {

      (navigator.clipboard as any) = {
        writeText: jest.fn(async() => undefined),
      };

      component.onClickedCopy('test');
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');

    });

  });

  describe('onCollectionSelected', () => {

    it('should dispatch a CustomEvent', async () => {

      component.dispatchEvent = jest.fn();
      const expectedEvent = new CustomEvent('selected-collection', { detail: mockCollection1 });
      component.onCollectionClicked(mockCollection1);
      expect(component.dispatchEvent).toHaveBeenCalledWith(expectedEvent);

    });

  });

  describe('HTML', () => {

    it('should call toggleImage and show popup when image is clicked', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;
      component.imagePopup.hidden = false;

      const image = component.shadowRoot.querySelector<HTMLElement>('img:first-of-type');
      image.click();
      expect(component.imagePopup.hidden).toEqual(true);

    });

    it('should call toggleImage and hide popup when cross icon is clicked', async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;
      component.imagePopup.hidden = true;

      const image = component.shadowRoot.querySelector<HTMLElement>('#dismiss-popup');
      image.click();
      expect(component.imagePopup.hidden).toEqual(false);

    });

    it('should call onClickedCopy when copy image url is clicked', async () => {

      component.onClickedCopy = jest.fn().mockResolvedValueOnce(void 0);
      window.document.body.appendChild(component);
      await component.updateComplete;

      const copy = component.shadowRoot.querySelector<HTMLElement>('.copy-image-url a');
      copy.click();
      expect(component.onClickedCopy).toHaveBeenCalledTimes(1);

    });

    it('should call onCollectionClicked when collection uri is clicked', async () => {

      component.onCollectionClicked = jest.fn();
      window.document.body.appendChild(component);
      await component.updateComplete;

      const copyAnchor = component.shadowRoot.querySelector<HTMLElement>('#collection-link');
      copyAnchor.click();

      expect(component.onCollectionClicked).toHaveBeenCalledTimes(1);

    });

    it('should show all 5 cards when the object is completely filled in ', async () => {

      component.object = mockObject1;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards).toHaveLength(5);

    });

    it('should hide cards when certain properties are undefined', async () => {

      // All fields with type Term[] are undefined
      component.object = mockObjectMinimal;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      // only show the image and identification fields, which always contain values
      // the other three should be hidden
      expect([ ...cards ].filter((card) => card.hidden)).toHaveLength(3);
      expect([ ...cards ].filter((card) => !card.hidden)).toHaveLength(2);

      // All fields with type Term[] are [], an empty array (added to cover all if statements)
      component.object = mockObjectEmpty;
      await component.updateComplete;

      const cards2 = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');

      expect([ ...cards2 ].filter((card) => card.hidden)).toHaveLength(3);
      expect([ ...cards2 ].filter((card) => !card.hidden)).toHaveLength(2);

    });

    it('should not render anything when object is undefined', async () => {

      component.object = undefined;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards).toHaveLength(0);

    });

  });

});
