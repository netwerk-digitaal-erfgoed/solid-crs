import { ProgressBarComponent } from './progress-bar-component';

describe('ProgressBarComponent', () => {

  let component = new ProgressBarComponent();

  beforeEach(() => {

    component = window.document.createElement('nde-progress-bar') as ProgressBarComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should display indeterminate progress bar when type is "indeterminate"', async () => {

    component.type = 'indeterminate';
    window.document.body.appendChild(component);
    await component.updateComplete;

    const indeterminate = window.document.body.getElementsByTagName('nde-progress-bar')[0].shadowRoot.querySelector<HTMLProgressElement>('.indeterminate');
    const determinate = window.document.body.getElementsByTagName('nde-progress-bar')[0].shadowRoot.querySelector<HTMLProgressElement>('.determinate');

    expect(indeterminate).toBeTruthy();
    expect(determinate).toBeFalsy();

  });

  it('should display determinate progress bar when type is "determinate"', async () => {

    component.type = 'determinate';
    window.document.body.appendChild(component);
    await component.updateComplete;

    const indeterminate = window.document.body.getElementsByTagName('nde-progress-bar')[0].shadowRoot.querySelector<HTMLProgressElement>('.indeterminate');
    const determinate = window.document.body.getElementsByTagName('nde-progress-bar')[0].shadowRoot.querySelector<HTMLProgressElement>('.determinate');

    expect(determinate).toBeTruthy();
    expect(indeterminate).toBeFalsy();

  });

  it('should set value on determinate progress bars', async () => {

    component.type = 'determinate';
    component.value = 50;
    window.document.body.appendChild(component);
    await component.updateComplete;

    const determinate = window.document.body.getElementsByTagName('nde-progress-bar')[0].shadowRoot.querySelector<HTMLProgressElement>('.determinate');

    expect(determinate).toBeTruthy();
    expect(determinate.value).toEqual(50);

  });

});
