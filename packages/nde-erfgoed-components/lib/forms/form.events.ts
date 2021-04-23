import { Event } from '../state/event';

/**
 * Event references for the collection component, with readable log format.
 */
export enum FormEvents {
  UPDATED_ELEMENT = '[FormEvent: Updated element]',
  SELECTED_ELEMENT = '[FormEvent: Selected element]',
  DESELECTED_ELEMENT = '[FormEvent: Deselected element]',
}

/**
 * Event interfaces for the collection component, with their payloads.
 */
export interface UpdatedElementEvent extends Event<FormEvents> { type: FormEvents.UPDATED_ELEMENT; update: (data: any) => any }
export interface SelectedElementEvent extends Event<FormEvents> { type: FormEvents.SELECTED_ELEMENT }
export interface DeselectedElementEvent extends Event<FormEvents> { type: FormEvents.DESELECTED_ELEMENT }
