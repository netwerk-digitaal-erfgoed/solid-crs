import { AlertComponent } from '../lib/alerts/alert.component';
import { FormElementComponent } from '../lib/forms/form-element.component';
import { SidebarListItemComponent } from '../lib/sidebar/sidebar-list-item.component';
import { SidebarListComponent } from '../lib/sidebar/sidebar-list.component';
import { DemoSidebarListComponent } from '../lib/demo/demo-sidebar-list.component';
import { ContentHeaderComponent } from '../lib/header/content-header.component';
import { CardComponent } from '../lib/collections/card.component';
import { CollectionCardComponent } from '../lib/collections/collection-card.component';
import { ObjectCardComponent } from '../lib/collections/object-card.component';
import { SidebarComponent } from '../lib/sidebar/sidebar.component';
import { SidebarItemComponent } from '../lib/sidebar/sidebar-item.component';
import { LargeCardComponent } from '../lib/collections/large-card.component';
import { ProgressBarComponent } from '../lib/loading/progress-bar-component';

/**
 * Register tags for components.
 */
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-sidebar-item', SidebarItemComponent);
customElements.define('nde-sidebar-list-item', SidebarListItemComponent);
customElements.define('nde-sidebar-list', SidebarListComponent);
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-demo-sidebar-list', DemoSidebarListComponent);
customElements.define('nde-content-header', ContentHeaderComponent);
customElements.define('nde-object-card', ObjectCardComponent);
customElements.define('nde-collection-card', CollectionCardComponent);
customElements.define('nde-card', CardComponent);
customElements.define('nde-large-card', LargeCardComponent);
customElements.define('nde-progress-bar', ProgressBarComponent);
