import { StateSchema } from 'xstate';

/**
 * A machine state's schema.
 */
export interface Schema<TContext, TStates extends string> extends StateSchema<TContext> {
  /**
   * States within the machine.
   */
  states?: {
    [key in TStates]: StateSchema<TContext>;
  };
}
