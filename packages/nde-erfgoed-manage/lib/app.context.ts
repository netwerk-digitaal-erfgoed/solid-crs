/* eslint-disable @typescript-eslint/no-empty-interface */

import { Alert } from '@digita-ai/nde-erfgoed-components';

/**
 * The root context of the application.
 */
export interface AppContext {
  /**
   * App-wide alerts.
   */
  alerts: Alert[];
}
