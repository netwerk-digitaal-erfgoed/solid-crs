import { CollectionComponent } from '../lib/collections/collection.component';
import { CollectionsComponent } from '../lib/collections/collections.component';
import { AlertComponent } from '../lib/alerts/alert.component';
import { FormElementComponent } from '../lib/forms/form-element.component';
import { ContentHeaderComponent } from '../lib/common/header/content-header.component';

/**
 * Register tags for components.
 */
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-content-header', ContentHeaderComponent);
