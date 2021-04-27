import { AlertComponent, CollectionsComponent, CollectionComponent } from '@digita-ai/nde-erfgoed-components';
import { AppRootComponent } from './app.root';
import { AuthenticateRootComponent } from './features/authenticate/authenticate-root.component';
import { CollectionsRootComponent } from './features/collections/root/collections-root.component';
import './index';

/**
 * Register tags for components.
 */
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-collections-root', CollectionsRootComponent);
customElements.define('nde-app-root', AppRootComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-authenticate-root', AuthenticateRootComponent);
