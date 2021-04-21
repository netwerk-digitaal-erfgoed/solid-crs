import {CollectionComponent} from '../lib/collections/collection.component';
import {CollectionsComponent} from '../lib/collections/collections.component';
import {AlertComponent} from '../lib/alerts/alert.component';

/**
 * Register tags for components.
 */
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-alert', AlertComponent);
