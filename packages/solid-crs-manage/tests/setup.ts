// Polyfill for encoding which isn't present globally in jsdom
// eslint-disable-next-line import/order, @typescript-eslint/no-var-requires
const crypto = require('crypto');
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
// Polyfill for crypto which isn't present globally in jsdom

Object.defineProperty(window.self, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
  },
});

import * as core from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { AlertComponent, CardComponent, CollectionCardComponent, ContentHeaderComponent, FormElementComponent, ObjectCardComponent, SidebarComponent, ProgressBarComponent, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import fetchMock from 'jest-fetch-mock';
import { ROUTER, RouterStates } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { TermSearchComponent } from '../lib/features/object/terms/term-search.component';
import { ObjectRootComponent } from '../lib/features/object/object-root.component';
import { SearchRootComponent } from '../lib/features/search/search-root.component';
import { CollectionRootComponent } from '../lib/features/collection/collection-root.component';
import { AppRootComponent } from '../lib/app-root.component';
import { AuthenticateSetupComponent } from '../lib/features/authenticate/authenticate-setup.component';
import { AuthenticateRootComponent } from '../lib/features/authenticate/authenticate-root.component';

// mock router function and state config
// essentially disables the router in tests
core.urlVariables = () => ({
  searchParams: {
    get: jest.fn(() => ''),
  },
  pathParams: {
    get: jest.fn(() => ''),
  },
});

core.activeRoute = () => ({
  path: undefined, targets: [],
  ...core.urlVariables(undefined),
});

core.routerStateConfig = () => ({
  [ROUTER]: {
    initial: RouterStates.IDLE,
    states: {
      [RouterStates.IDLE]: {
        id: RouterStates.IDLE,
      },
      [RouterStates.NAVIGATING]: {
        id: RouterStates.NAVIGATING,
        invoke: {
          src: async () => Promise.resolve(),
          onDone: {
            target: [],
            actions: [],
          },
        },
      },
    },
  },
});

/**
 * Enable mocks for fetch.
 */
fetchMock.enableMocks();

process.env.VITE_TERM_ENDPOINT = 'https://endpoint.url/';

/**
 * Register tags for components.
 */
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-collection-root', CollectionRootComponent);
customElements.define('nde-object-root', ObjectRootComponent);
customElements.define('nde-search-root', SearchRootComponent);
customElements.define('nde-content-header', ContentHeaderComponent);
customElements.define('nde-collection-card', CollectionCardComponent);
customElements.define('nde-object-card', ObjectCardComponent);
customElements.define('nde-card', CardComponent);
customElements.define('nde-app-root', AppRootComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-authenticate-root', AuthenticateRootComponent);
customElements.define('nde-authenticate-setup', AuthenticateSetupComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-progress-bar', ProgressBarComponent);
customElements.define('nde-term-search', TermSearchComponent);
