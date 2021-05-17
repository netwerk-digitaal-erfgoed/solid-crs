import { DemoFormComponent } from './demo/demo-form.component';
import { FormElementComponent } from './forms/form-element.component';
import { AlertComponent } from './alerts/alert.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ObjectCardComponent } from './collections/object-card.component';
import { SidebarListItemComponent } from './sidebar/sidebar-list-item.component';
import { SidebarListComponent } from './sidebar/sidebar-list.component';
import { DemoSidebarListComponent } from './demo/demo-sidebar-list.component';
import { ContentHeaderComponent } from './header/content-header.component';
import { DemoContentHeaderComponent } from './demo/demo-content-header.component';
import { DemoSVGComponent } from './demo/demo-svg.component';
import { DemoNDECardComponent } from './demo/demo-card.component';
import { CardComponent } from './collections/card.component';
import { CollectionCardComponent } from './collections/collection-card.component';

/**
 * Register tags for components.
 */
customElements.define('nde-card', CardComponent);
customElements.define('nde-object-card', ObjectCardComponent);
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
customElements.define('nde-demo-svg', DemoSVGComponent);
