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
import { ROUTER, RouterStates } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { AlertComponent, CardComponent, CollectionCardComponent, ContentHeaderComponent, FormElementComponent, ObjectCardComponent, SidebarComponent, ProgressBarComponent, SidebarItemComponent, SidebarListComponent, SidebarListItemComponent, LargeCardComponent, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import fetchMock from 'jest-fetch-mock';
import { AboutRootComponent } from '../lib/features/about/about-root.component';
import { ObjectRootComponent } from '../lib/features/object/object-root.component';
import { SearchRootComponent } from '../lib/features/search/search-root.component';
import { CollectionRootComponent } from '../lib/features/collection/collection-root.component';
import { AppRootComponent } from '../lib/app-root.component';

// mock router function and state config
// essentially disables the router in tests
core.activeRoute = () => ({ path: undefined, targets: [] });

core.urlVariables = () => ({
  get: jest.fn(() => ''),
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

core.MemoryTranslator = core.MockTranslator;

/**
 * Enable mocks for fetch.
 */
fetchMock.enableMocks();

/**
 * Register tags for components.
 */
customElements.define('nde-search-root', SearchRootComponent);
customElements.define('nde-collection-root', CollectionRootComponent);
customElements.define('nde-object-root', ObjectRootComponent);
customElements.define('nde-about-root', AboutRootComponent);
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-content-header', ContentHeaderComponent);
customElements.define('nde-card', CardComponent);
customElements.define('nde-object-card', ObjectCardComponent);
customElements.define('nde-large-card', LargeCardComponent);
customElements.define('nde-collection-card', CollectionCardComponent);
customElements.define('nde-sidebar-list-item', SidebarListItemComponent);
customElements.define('nde-sidebar-list', SidebarListComponent);
customElements.define('nde-sidebar-item', SidebarItemComponent);
customElements.define('nde-progress-bar', ProgressBarComponent);
customElements.define('nde-app-root', AppRootComponent);
customElements.define('nde-popup', PopupComponent);
