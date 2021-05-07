import { DemoFormComponent } from './demo/demo-form.component';
import { FormElementComponent } from './forms/form-element.component';
import { CollectionComponent } from './collections/collection.component';
import { CollectionsComponent } from './collections/collections.component';
import { AlertComponent } from './alerts/alert.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CollectionObjectCardComponent } from './collections/collection-object-card.component';
import { SidebarListItemComponent } from './sidebar/sidebar-list-item.component';
import { SidebarListComponent } from './sidebar/sidebar-list.component';
import { DemoSidebarListComponent } from './demo/demo-sidebar-list.component';
import { ContentHeaderComponent } from './header/content-header.component';
import { DemoContentHeaderComponent } from './demo/demo-content-header.component';
import { DemoNDECardComponent } from './demo/demo-nde-card.component';
import { NDECard } from './collections/nde-card.component';
import { CollectionCardComponent } from './collections/collection-card.component';

/**
 * Register tags for components.
 */
customElements.define('nde-card', NDECard);
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-collection-object-card', CollectionObjectCardComponent);
customElements.define('nde-collection-card', CollectionCardComponent);
customElements.define('nde-demo-nde-card', DemoNDECardComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-demo-form', DemoFormComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-sidebar-list-item', SidebarListItemComponent);
customElements.define('nde-sidebar-list', SidebarListComponent);
customElements.define('nde-demo-sidebar-list', DemoSidebarListComponent);
customElements.define('nde-content-header', ContentHeaderComponent);
customElements.define('nde-demo-content-header', DemoContentHeaderComponent);
