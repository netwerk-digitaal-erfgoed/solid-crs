/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/dot-notation */
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {

  let component: PaginatorComponent;

  beforeEach(() => {

    component = window.document.createElement('nde-paginator') as PaginatorComponent;
    component.pageIndex = 0;
    component.objectsPerPage = 18;
    component.objectsAmount = 40;

    component.translator = {
      translate: () => 'page 1 of 10',
    } as any;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;
    expect(component).toBeTruthy();

  });

  describe('HTML', () => {

    beforeEach(async () => {

      window.document.body.appendChild(component);
      await component.updateComplete;

    });

    it('should disable previous button when on first page', async () => {

      component.pageIndex = 0;
      await component.updateComplete;
      expect(component.shadowRoot.querySelector<HTMLButtonElement>('button.previous').disabled).toBeTruthy();

    });

    it('should disable next button when on last page', async () => {

      // 40 objects, 18 per page, on page 3 (index 2)
      component.pageIndex = 2;
      await component.updateComplete;
      expect(component.shadowRoot.querySelector<HTMLButtonElement>('button.next').disabled).toBeTruthy();

    });

  });

  describe('onNext', () => {

    it('should dispatch next CustomEvent', async (done) => {

      component.addEventListener('next', () => done());
      component['onNext']();

    });

  });

  describe('onPrevious', () => {

    it('should dispatch previous CustomEvent', async (done) => {

      component.addEventListener('previous', () => done());
      component['onPrevious']();

    });

  });

});
