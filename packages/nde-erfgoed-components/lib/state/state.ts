import { StateValueMap, Typestate } from 'xstate';

/**
 * Represents a state node with its corresponding context.
 */
export interface State<TStates extends string, TContext> extends Typestate<TContext> {
  /**
   * The value of the state node.
   */
  value: TStates | StateValueMap;

  /**
   * The state's corresponding context.
   */
  context: TContext;
}
