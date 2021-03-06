import { AlertComponent, CardComponent, CollectionCardComponent, ContentHeaderComponent, FormElementComponent, LargeCardComponent, ObjectCardComponent, SidebarComponent, SidebarItemComponent, SidebarListComponent, SidebarListItemComponent, ProgressBarComponent, PopupComponent, PaginatorComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { inspect } from '@xstate/inspect';
import { SearchRootComponent } from './features/search/search-root.component';
import { AppRootComponent } from './app-root.component';
import { CollectionRootComponent } from './features/collection/collection-root.component';
import { ObjectRootComponent } from './features/object/object-root.component';
import './index';
import { AboutRootComponent } from './features/about/about-root.component';
import { ObjectCompareComponent } from './features/object/compare/object-compare.component';
import { ObjectOverviewComponent } from './features/object/overview/object-overview.component';

/**
 * Starts the xstate devtools
 *
 * https://github.com/davidkpiano/xstate/tree/master/packages/xstate-inspect
 */
if (process.env.MODE === 'DEV') {

  inspect({
    iframe: false, // open in new window
  });

}

/**
 * Register tags for components.
 */
customElements.define('nde-search-root', SearchRootComponent);
customElements.define('nde-collection-root', CollectionRootComponent);
customElements.define('nde-object-root', ObjectRootComponent);
customElements.define('nde-object-overview', ObjectOverviewComponent);
customElements.define('nde-object-compare', ObjectCompareComponent);
customElements.define('nde-about-root', AboutRootComponent);
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
customElements.define('nde-progress-bar', ProgressBarComponent);
customElements.define('nde-popup', PopupComponent);
customElements.define('nde-paginator', PaginatorComponent);
