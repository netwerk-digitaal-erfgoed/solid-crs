import {CollectionsComponent, CollectionComponent} from '@digita-ai/nde-erfgoed-components';
import {CollectionsRootComponent} from './features/collections/root/collections-root.component';
import './index';

/**
 * Register tags for components.
 */
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-collections-root', CollectionsRootComponent);
