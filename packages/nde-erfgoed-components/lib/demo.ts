import {CollectionComponent} from './collections/collection.component';
import {CollectionsComponent} from './collections/collections.component';
import { DemoFormComponent } from './demo/demo-form.component';
import { FormElementComponent } from './forms/form-element.component';
import { FormComponent } from './forms/form.component';

/**
 * Register tags for components.
 */
customElements.define('nde-collection', CollectionComponent);
customElements.define('nde-collections', CollectionsComponent);
customElements.define('nde-form-element', FormElementComponent);
customElements.define('nde-form', FormComponent);
customElements.define('nde-demo-form', DemoFormComponent);
