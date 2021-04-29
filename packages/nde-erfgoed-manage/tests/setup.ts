import {CollectionsComponent, AlertComponent, CollectionComponent} from '@digita-ai/nde-erfgoed-components';
import {CollectionsRootComponent} from '../lib/features/collections/collections-root.component';
import {AppRootComponent} from '../lib/app.root';

/**
 * Register tags for components.
 */
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-collections-root', CollectionsRootComponent);
customElements.define('nde-app-root', AppRootComponent);
