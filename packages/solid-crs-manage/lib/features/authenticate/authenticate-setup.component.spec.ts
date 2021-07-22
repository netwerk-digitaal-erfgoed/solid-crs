import { Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, ConsoleLogger, LoggerLevel } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { ClickedAdministratorTypeEvent, ClickedInstitutionTypeEvent } from '../../app.events';
import { AppContext, appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { AuthenticateSetupComponent } from './authenticate-setup.component';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

describe('AuthenticateSetupComponent', () => {

  let component: AuthenticateSetupComponent;
  let machine: Interpreter<AppContext>;

  const collection1: Collection = {
    uri: 'collection-uri-3',
    name: 'Collection 3',
    description: 'This is collection 3',
    objectsUri: 'test-uri',
    distribution: 'test-uri',
  };

  const collection2: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: 'test-uri',
    distribution: 'test-uri',
  };

  const collection3: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: 'test-uri',
    distribution: 'test-uri',
  };

  const object1: CollectionObject = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: '0',
    collection: 'collection-uri-1',
  };

  beforeEach(() => {

    machine = interpret(appMachine(
      solid,
      new CollectionMemoryStore([
        collection2,
        collection3,
      ]),
      new CollectionObjectMemoryStore([
        object1,
      ]),
      collection1,
      object1
    )
      .withContext({
        alerts: [],
        session: { webId: 'lorem' },
      }));

    component = window.document.createElement('nde-authenticate-setup') as AuthenticateSetupComponent;

    component.actor = machine;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should show two buttons', async () => {

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    const buttons = window.document.body.getElementsByTagName('nde-authenticate-setup')[0].shadowRoot.querySelector('div.form-container').children;

    expect(buttons).toBeTruthy();
    expect(buttons.length).toEqual(2);

  });

  it('should send ClickedAdministratorTypeEvent when admin button is clicked', async (done) => {

    machine.onEvent((event) => {

      if (event instanceof ClickedAdministratorTypeEvent) {

        done();

      }

    });

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    const button = window.document.body.getElementsByTagName('nde-authenticate-setup')[0].shadowRoot
      .querySelector('div.form-container').children[0] as HTMLButtonElement;

    button.click();

  });

  it('should send ClickedInstitutionTypeEvent when institution button is clicked', async (done) => {

    machine.onEvent((event) => {

      if (event instanceof ClickedInstitutionTypeEvent) {

        done();

      }

    });

    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

    const button = window.document.body.getElementsByTagName('nde-authenticate-setup')[0].shadowRoot
      .querySelector('div.form-container').children[1] as HTMLButtonElement;

    button.click();

  });

});
