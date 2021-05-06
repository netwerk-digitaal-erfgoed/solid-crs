import { AlertComponent, CollectionsComponent, CollectionComponent, FormElementComponent, SidebarComponent } from '@digita-ai/nde-erfgoed-components';
import { inspect } from '@xstate/inspect';
import { AppRootComponent } from './app-root.component';
import { AuthenticateRootComponent } from './features/authenticate/authenticate-root.component';
import { CollectionRootComponent } from './features/collection/collection-root.component';
import './index';

/**
 * Starts the xstate devtools
 *
 * https://github.com/davidkpiano/xstate/tree/master/packages/xstate-inspect
 */
inspect({
  iframe: false, // open in new window
});

/**
 * Register tags for components.
 */
customElements.define('nde-sidebar', SidebarComponent);
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-collections-root', CollectionRootComponent);
customElements.define('nde-app-root', AppRootComponent);
customElements.define('nde-alert', AlertComponent);
customElements.define('nde-authenticate-root', AuthenticateRootComponent);
customElements.define('nde-form-element', FormElementComponent);
