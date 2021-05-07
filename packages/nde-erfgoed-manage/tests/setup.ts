import { CollectionsComponent, AlertComponent, CollectionComponent, SidebarComponent, FormElementComponent } from '@digita-ai/nde-erfgoed-components';
import fetchMock from 'jest-fetch-mock';
import { AuthenticateRootComponent } from '../lib/features/authenticate/authenticate-root.component';
import { AppRootComponent } from '../lib/app-root.component';
import { CollectionRootComponent } from '../lib/features/collection/collection-root.component';

/**
 * Enable mocks for fetch.
 */
fetchMock.enableMocks();

/**
 * Register tags for components.
 */
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-collection', CollectionsComponent);
customElements.define('nde-collection-root', CollectionRootComponent);
customElements.define('nde-app-root', AppRootComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-authenticate-root', AuthenticateRootComponent);
customElements.define('nde-form-element', FormElementComponent);
