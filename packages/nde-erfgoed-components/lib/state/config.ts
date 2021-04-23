import { MachineConfig } from 'xstate';
import { Schema } from './schema';
import { Event } from './event';

export type Config<TContext, TStates extends string, TEvents extends string> = MachineConfig<TContext, Schema<TContext, TStates>, Event<TEvents>>;
