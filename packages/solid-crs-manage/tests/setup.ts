import { AlertComponent, CardComponent, CollectionCardComponent, ContentHeaderComponent, FormElementComponent, ObjectCardComponent, SidebarComponent, ProgressBarComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import fetchMock from 'jest-fetch-mock';
import { AuthenticateRootComponent } from '../lib/features/authenticate/authenticate-root.component';
import { AuthenticateSetupComponent } from '../lib/features/authenticate/authenticate-setup.component';
import { AppRootComponent } from '../lib/app-root.component';
import { CollectionRootComponent } from '../lib/features/collection/collection-root.component';
import { SearchRootComponent } from '../lib/features/search/search-root.component';
import { ObjectRootComponent } from '../lib/features/object/object-root.component';
import { TermSearchComponent } from '../lib/features/object/terms/term-search.component';

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
