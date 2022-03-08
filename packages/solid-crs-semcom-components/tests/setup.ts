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

import { AlertComponent, ContentHeaderComponent, FormElementComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import fetchMock from 'jest-fetch-mock';
import { ObjectIdentificationComponent } from '../lib/object-identification.component';
import { ObjectDimensionsComponent } from '../lib/object-dimensions.component';
import { ObjectRepresentationComponent } from '../lib/object-representation.component';
import { ObjectCreationComponent } from '../lib/object-creation.component';
import { ObjectImageryComponent } from '../lib/object-imagery.component';
import { ObjectLoanComponent } from '../lib/object-loan.component';

/**
 * Enable mocks for fetch.
 */
fetchMock.enableMocks();

/**
 * Register tags for components.
 */
customElements.define('nde-content-header', ContentHeaderComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-object-imagery', ObjectImageryComponent);
customElements.define('nde-object-identification', ObjectIdentificationComponent);
customElements.define('nde-object-representation', ObjectRepresentationComponent);
customElements.define('nde-object-creation', ObjectCreationComponent);
customElements.define('nde-object-dimensions', ObjectDimensionsComponent);
customElements.define('nde-object-loan', ObjectLoanComponent);
