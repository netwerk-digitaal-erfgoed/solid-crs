import {CollectionsComponent, CollectionComponent} from '@digita-ai/nde-erfgoed-components';
import {CollectionsPageComponent} from './features/collections/collections-page.component';
import './index';

/**
 * Register tags for components.
 */
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-collections-page', CollectionsPageComponent);
