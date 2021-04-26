import { CollectionComponent } from './collections/collection.component';
import { CollectionsComponent } from './collections/collections.component';
import { AlertComponent } from './alerts/alert.component';

/**
 * Register tags for components.
 */
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-alert', AlertComponent);
