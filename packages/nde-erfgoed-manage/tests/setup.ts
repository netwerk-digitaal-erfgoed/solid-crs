import {CollectionsComponent} from '@digita-ai/nde-erfgoed-components';
import {CollectionsRootComponent} from '../lib/features/collections/collections-page.component';

/**
 * Register tags for components.
 */
customElements.define('nde-collections', CollectionsComponent as any);
customElements.define('nde-collections-root', CollectionsRootComponent);
