import { Alert, Event } from '@digita-ai/nde-erfgoed-components';
import { sendParent } from 'xstate';
import { AppEvents } from '../../app.events';

/**
 * Event references for the collection component, with readable log format.
 */
export enum CollectionsEvents {
  CLICKED_DELETE              = '[CollectionsEvent: Clicked Delete]',
  CLICKED_EDIT                = '[CollectionsEvent: Clicked Edit]',
  CANCELLED_EDIT              = '[CollectionsEvent: Cancelled Edit]',
  CLICKED_CREATE_OBJECT       = '[CollectionsEvent: Clicked Create Object]',
}

/**
 * Event interfaces for the collection component, with their payloads.
 */
export interface ClickedDeleteEvent extends Event<CollectionsEvents> { type: CollectionsEvents.CLICKED_DELETE }
export interface ClickedEditEvent extends Event<CollectionsEvents> { type: CollectionsEvents.CLICKED_EDIT }
export interface CancelledEditEvent extends Event<CollectionsEvents> { type: CollectionsEvents.CANCELLED_EDIT }
export interface ClickedCreateObjectEvent extends Event<CollectionsEvents> { type: CollectionsEvents.CLICKED_CREATE_OBJECT }

/**
 * Actions for the collections component.
 */

/**
 * Adds an alert to the machine's parent.
 *
 * @param alert Alert to be added.
 * @returns An action which sends an add alert event to the machine's parent.
 */
export const addAlert = (alert: Alert) => sendParent((context, event) => ({
  alert,
  type: AppEvents.ADD_ALERT,
}));
