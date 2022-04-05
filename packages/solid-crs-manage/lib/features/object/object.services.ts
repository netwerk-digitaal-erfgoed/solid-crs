import { asUrl, getSolidDataset, getThing, getUrl, getUrlAll } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { ObjectUpdate } from './models/object-update.model';
import { ObjectEvent } from './object.events';
import { ObjectContext } from './object.machine';

/**
 * Loads and returns all incoming loan requests for a heritage institution
 */
export const loadNotifications = async (context: ObjectContext, event: ObjectEvent): Promise<ObjectUpdate[]> => {

  // eslint-disable-next-line no-console
  console.log('Loading Notifications');

  const webId = context.solidService.getDefaultSession().info.webId;

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
          originalObject: getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#object') ?? undefined,
          updatedObject: getUrl(notificationThing, 'https://netwerkdigitaalerfgoed.nl/voc/updatedObject') ?? undefined,
          to: getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#target') ?? undefined,
          from: getUrl(notificationThing, 'https://www.w3.org/ns/activitystreams#actor') ?? undefined,
        };

        objectUpdates.push(parsedObjectUpdate);

      }

    }

  }

  return objectUpdates;

};
