import {CollectionsComponent, AlertComponent, CollectionComponent} from '@digita-ai/nde-erfgoed-components';
import fetchMock from 'jest-fetch-mock';
import {CollectionsRootComponent} from '../lib/features/collections/collections-root.component';
import {AppRootComponent} from '../lib/app.root';
import { AuthenticateRootComponent } from '../lib/features/authenticate/authenticate-root.component';

/**
 * Enable mocks for fetch.
 */
fetchMock.enableMocks();

/**
 * Register tags for components.
 */
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-collections-root', CollectionsRootComponent);
customElements.define('nde-authenticate-root', AuthenticateRootComponent);
customElements.define('nde-app-root', AppRootComponent);
