import { StateSchema } from 'xstate';

export interface Schema<TContext, TStates extends string> extends StateSchema<TContext> {
  states?: {
    [key in TStates]?: StateSchema<TContext>;
  };
}
