/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { Collection, CollectionObject, CollectionObjectMemoryStore, CollectionSolidStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { ClickedAdministratorTypeEvent, ClickedCreatePodEvent, ClickedInstitutionTypeEvent, ClickedLogoutEvent, SetProfileEvent } from '../../app.events';
import { AppContext, AppDataStates, appMachine, AppRootStates } from '../../app.machine';
import { AuthenticateSetupComponent } from './authenticate-setup.component';

let solidService: SolidSDKService;
let collectionStore: CollectionSolidStore;

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

  beforeEach(async () => {

    solidService = {
      getStorages: jest.fn(async () => [ 'https://storage.uri/' ]),
    } as any;

    collectionStore = {
      getInstanceForClass: jest.fn(async () => undefined),
    } as any;

    machine = interpret(appMachine(
      solidService,
      collectionStore,
      new CollectionObjectMemoryStore([
        object1,
      ]),
      collection1,
      object1
    )
      .withContext({
        alerts: [],
        session: { webId: 'lorem' },
        profile: {
          name: 'Lea Peeters',
          uri: 'https://web.id/',
        },
      }));

    machine.onTransition(async () => await component.updateComplete);

    component = window.document.createElement('nde-authenticate-setup') as AuthenticateSetupComponent;

    component.actor = machine;
    machine.start();
    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  describe('admin setup', () => {

    beforeEach(() => {

      // set correct data state ()
      machine.start();

      machine.send(new SetProfileEvent());

    });

    it('should show two buttons', (done) => {

      machine.onTransition((state) => {

        if (state.matches({ [AppRootStates.DATA]: AppDataStates.DETERMINING_POD_TYPE })) {

          const buttons = window.document.body.getElementsByTagName('nde-authenticate-setup')[0].shadowRoot.querySelector('div.form-container').children;
          expect(buttons).toBeTruthy();
          expect(buttons.length).toEqual(2);
          done();

        }

      });

      machine.start();

    });

    it('should send ClickedAdministratorTypeEvent when admin button is clicked', async () => {

      machine.send(new ClickedCreatePodEvent());
      component.actor.send = jest.fn();
      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.onTransition(async (state) => {

        await component.updateComplete;

        if (state.matches({ [AppRootStates.DATA]: AppDataStates.DETERMINING_POD_TYPE })) {

          const button = window.document.body.getElementsByTagName('nde-authenticate-setup')[0].shadowRoot
            .querySelector('div.form-container').children[0] as HTMLButtonElement;

          button.click();
          expect(component.actor.send).toHaveBeenCalledWith(new ClickedAdministratorTypeEvent());

        }

      });

    });

    it('should send ClickedInstitutionTypeEvent when institution button is clicked', async () => {

      machine.send(new ClickedCreatePodEvent());
      component.actor.send = jest.fn();
      window.document.body.appendChild(component);
      await component.updateComplete;

      machine.onTransition(async (state) => {

        await component.updateComplete;

        if (state.matches({ [AppRootStates.DATA]: AppDataStates.DETERMINING_POD_TYPE })) {

          const button = component.shadowRoot.querySelector('div.form-container').children[1] as HTMLButtonElement;

          button.click();
          expect(component.actor.send).toHaveBeenCalledWith(new ClickedInstitutionTypeEvent());

        }

      });

    });

  });

  describe('pod creation', () => {

    beforeEach(async () => {

      solidService.getStorages = jest.fn(async () => [ ]);

      machine = interpret(appMachine(
        solidService,
        collectionStore,
        new CollectionObjectMemoryStore([
          object1,
        ]),
        collection1,
        object1
      )
        .withContext({
          alerts: [],
          session: { webId: 'lorem' },
          profile: {
            name: 'Lea Peeters',
            uri: 'https://web.id/',
          },
        }));

      component.actor = machine;

      machine.start();

      machine.send(new SetProfileEvent());

    });

  });

  describe('onClickedCreatePod', () => {

    it('should send ClickedCreatePodEvent to machine', async () => {

      machine.send = jest.fn();
      component['onClickedCreatePod']();
      expect(machine.send).toHaveBeenCalledWith(new ClickedCreatePodEvent());

    });

  });

  describe('onClickedCancel', () => {

    it('should send ClickedLogoutEvent to machine', async () => {

      machine.send = jest.fn();
      component['onClickedCancel']();
      expect(machine.send).toHaveBeenCalledWith(new ClickedLogoutEvent());

    });

  });

  it('should not render anything when between states', async () => {

    // dont wait for getStorages to complete
    window.document.body.appendChild(component);
    await component.updateComplete;

    [ ... component.shadowRoot.children ].forEach((child) => {

      // component should only have style elements, no other elements
      expect(child).toBeInstanceOf(HTMLStyleElement);

    });

  });

});
