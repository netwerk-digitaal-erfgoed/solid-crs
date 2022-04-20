import { asUrl, getSolidDataset, getThing, getUrl, getUrlAll } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { ObjectUpdate } from './models/object-update.model';
import { ClickedImportUpdates, ObjectEvent } from './object.events';
import { ObjectContext } from './object.machine';

/**
 * Loads and returns all incoming loan requests for a heritage institution
 */
export const loadNotifications = async (context: ObjectContext, event: ObjectEvent): Promise<ObjectUpdate[]> => {

  // eslint-disable-next-line no-console
  console.log('Loading Notifications');

  // get all unique inboxes
  const inbox = await context.objectStore.getInbox(context.object);
  const dataset = await getSolidDataset(inbox);
  const inboxThing = getThing(dataset, inbox);

  const notificationUris = getUrlAll(inboxThing, 'http://www.w3.org/ns/ldp#contains');

  // retrieve notifications from all inboxes
  const objectUpdates: ObjectUpdate[] = [];

  for (const notificationUri of notificationUris) {

    const notificationDataset = await getSolidDataset(
      notificationUri,
      { fetch: context.solidService.getDefaultSession().fetch }
    );

    const notificationThing = getThing(notificationDataset, notificationUri);
    const objectUpdateType = 'https://www.w3.org/ns/activitystreams#Update';

    // filter for metadata updates
    if (getUrl(notificationThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') === objectUpdateType) {

      // filter for relevant object
      if (getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#object') === context.object.uri) {

        const parsedObjectUpdate: ObjectUpdate = {
          uri: asUrl(notificationThing) ?? undefined,
          originalObject: getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#context') ?? undefined,
          updatedObject: getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#object') ?? undefined,
          to: getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#target') ?? undefined,
          from: getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#actor') ?? undefined,
        };

        objectUpdates.push(parsedObjectUpdate);

      }

    }

  }

  return objectUpdates;

};

export const importUpdates = async (context: ObjectContext, event: ObjectEvent): Promise<CollectionObject> => {

  // eslint-disable-next-line no-console
  console.log('Importing Updates');

  if (!(event instanceof ClickedImportUpdates)) {

    // eslint-disable-next-line no-console
    console.error('Event:', event);
    throw Error('Event is not of type ClickedImportUpdates');

  }

  // get updated object
  const updatedObject = await context.objectStore.get(event.collectionUri);

  // merge existing object with updated object
  return {
    ... updatedObject,
    uri: context.object.uri,
    maintainer: context.object.maintainer,
    collection: context.object.collection,
  };

};
