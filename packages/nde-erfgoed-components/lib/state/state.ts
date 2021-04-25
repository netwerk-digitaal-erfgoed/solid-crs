/**
 * Represents a state node with its corresponding context.
 */
export interface State<TStates, TContext> {
  /**
   * The value of the state node.
   */
  value: TStates;

  /**
   * The state's corresponding context.
   */
  context: TContext;
}
