import { LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { MockTranslator, Term } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { mockCollection1, mockCollection2, mockObject1, mockObject2, mockObjectEmpty, mockObjectMinimal } from '../../../../tests/test-data';
import { ObjectCompareComponent } from './object-compare.component';

describe('ObjectCompareComponent', () => {

  let component: ObjectCompareComponent;

  beforeEach(async () => {

    const mockActor = new Promise((resolve) => resolve({
      send: jest.fn(),
      context: {
        collections: [ mockCollection1, mockCollection2 ],
        object: mockObjectMinimal,
        updatedObject: mockObject1,
      },
    })) as any;

    component = window.document.createElement('nde-object-compare') as ObjectCompareComponent;
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

      component.onClickedCopy = jest.fn().mockResolvedValue({});
      window.document.body.appendChild(component);
      await component.updateComplete;

      const copy = component.shadowRoot.querySelectorAll<HTMLElement>('.copy-image-url a');
      copy.forEach((copyCopy) => copyCopy.click());
      expect(component.onClickedCopy).toHaveBeenCalledTimes(2);

    });

    it('should show all 5 cards when changes exist in every category', async () => {

      component.object = mockObjectMinimal;
      component.updatedObject = mockObject1;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards).toHaveLength(5);

    });

    it('should hide cards where no changes exist', async () => {

      // Only the dimensions category differs
      component.object = mockObjectMinimal;
      component.updatedObject = { ... mockObjectMinimal, width: 20 };
      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards).toHaveLength(1);

      // Only the creation category differs
      component.object = {
        ...mockObjectMinimal,
        creator: [ { uri: 'https://term.uri', name: 'term' } ] as Term[],
      };

      component.updatedObject = {
        ... mockObjectMinimal,
        creator: [ { uri: 'https://term2.uri', name: 'term' } ] as Term[],
      };

      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards2 = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards2).toHaveLength(1);

      // All categories but dimensions differ
      component.object = mockObjectMinimal;
      component.updatedObject = mockObject2;
      await component.updateComplete;

      const cards3 = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards3).toHaveLength(4);

      // All categories differ
      component.object = mockObject1;
      component.updatedObject = mockObjectEmpty;
      await component.updateComplete;

      const cards4 = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards4).toHaveLength(5);

    });

    it('should not render anything when both objects are the same', async () => {

      component.object = mockObject1;
      component.updatedObject = mockObject1;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards).toHaveLength(0);

    });

    it('should not render anything when both objects are undefined', async () => {

      component.object = undefined;
      component.updatedObject = undefined;
      window.document.body.appendChild(component);
      await component.updateComplete;

      const cards = component.shadowRoot.querySelectorAll<LargeCardComponent>('nde-large-card');
      expect(cards).toHaveLength(0);

    });

  });

});
