import { AlertComponent, CardComponent, CollectionCardComponent, ContentHeaderComponent, FormElementComponent, ObjectCardComponent, SidebarComponent, ProgressBarComponent, SidebarItemComponent, SidebarListComponent, SidebarListItemComponent, LargeCardComponent, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import fetchMock from 'jest-fetch-mock';
import { AppRootComponent } from '../lib/app-root.component';
import { CollectionRootComponent } from '../lib/features/collection/collection-root.component';
import { SearchRootComponent } from '../lib/features/search/search-root.component';
import { ObjectRootComponent } from '../lib/features/object/object-root.component';
import { AboutRootComponent } from '../lib/features/about/about-root.component';

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
