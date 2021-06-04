import { AlertComponent, CardComponent, CollectionCardComponent, ContentHeaderComponent, FormElementComponent, LargeCardComponent, ObjectCardComponent, SidebarComponent, SidebarItemComponent, SidebarListComponent, SidebarListItemComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { inspect } from '@xstate/inspect';
import { SearchRootComponent } from './features/search/search-root.component';
import { AppRootComponent } from './app-root.component';
import { AuthenticateRootComponent } from './features/authenticate/authenticate-root.component';
import { CollectionRootComponent } from './features/collection/collection-root.component';
import { ObjectRootComponent } from './features/object/object-root.component';
import { ObjectImageryComponent } from './features/object/components/object-imagery.component';
import './index';
import { ObjectDimensionsComponent } from './features/object/components/object-dimensions.component';
import { ObjectIdentificationComponent } from './features/object/components/object-identification.component';
import { ObjectRepresentationComponent } from './features/object/components/object-representation.component';
import { ObjectCreationComponent } from './features/object/components/object-creation.component';

/**
 * Starts the xstate devtools
 *
 * https://github.com/davidkpiano/xstate/tree/master/packages/xstate-inspect
 */
inspect({
  iframe: false, // open in new window
});

/**
 * Register tags for components.
 */
customElements.define('nde-search-root', SearchRootComponent);
customElements.define('nde-collection-root', CollectionRootComponent);
customElements.define('nde-authenticate-root', AuthenticateRootComponent);
customElements.define('nde-object-root', ObjectRootComponent);
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-app-root', AppRootComponent);
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
customElements.define('nde-object-imagery', ObjectImageryComponent);
customElements.define('nde-object-identification', ObjectIdentificationComponent);
customElements.define('nde-object-representation', ObjectRepresentationComponent);
customElements.define('nde-object-creation', ObjectCreationComponent);
customElements.define('nde-object-dimensions', ObjectDimensionsComponent);
