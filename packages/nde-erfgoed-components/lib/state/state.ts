import { StateValue, Typestate } from 'xstate';

/**
 * Represents a state node with its corresponding context.
 */
export interface State<TStates extends StateValue, TContext> extends Typestate<TContext> {
  /**
   * The value of the state node.
   */
  value: TStates;

  /**
   * The state's corresponding context.
   */
  context: TContext;
}
