import { asUrl, getSolidDataset, getThing, getUrl, Thing } from '@digita-ai/inrupt-solid-client';
import { getUrlAll } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { v4 } from 'uuid';
import { LoanContext } from './loan.context';
import { ClickedAcceptedLoanRequestEvent, ClickedRejectedLoanRequestEvent, ClickedSendLoanRequestEvent, LoanEvent } from './loan.events';

/**
 * Creates a notification body in text/turtle
 */
const createNotificationBody = (notificationArgs: {
  inbox: string;
  notificationId: string;
  type: string;
  summary: string;
  actor: string;
  target: string;
  object: string;
  origin?: string;
}): string => `@prefix as: <https://www.w3.org/ns/activitystreams#> .

<${notificationArgs.inbox}${notificationArgs.notificationId}>
  a <${notificationArgs.type}> ;
  as:summary "${notificationArgs.summary}" ;
  as:actor <${notificationArgs.actor}> ;
  as:target <${notificationArgs.target}> ;
  as:object <${notificationArgs.object}> ;
  as:origin <${notificationArgs.origin ?? `${process.env.VITE_WEBID_URI}collectiebeheersysteem`}> .
`;

/**
 * Sends a new loan request LDN to a heritage institution
 *
 * @param loanRequest the loanRequest to create / send
 * @returns the given loanRequest when creation was successful
 */
export const createRequest = async (context: LoanContext, event: LoanEvent): Promise<LoanRequest> => {

  if (!(event instanceof ClickedSendLoanRequestEvent)) {

    throw new Error('event is not of type ClickedSendLoanRequestEvent');

  }

  // eslint-disable-next-line no-console
  console.log('Sending new loan request');

  // retrieve necessary collection information
  const {
    uri: collectionUri,
    inbox: targetInbox,
    publisher: target,
  } = await context.collectionStore.get(event.loanRequestCreationArgs.collection);

  const notificationId = v4();

  const body = createNotificationBody({
    inbox: targetInbox,
    notificationId,
    type: 'https://www.w3.org/ns/activitystreams#Offer',
    summary: 'Bruikleen aanvraag',
    actor: context.solidService.getDefaultSession().info.webId,
    target,
    object: collectionUri,
  });

  const response = await fetch(targetInbox, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
      'Slug': notificationId,
    },
    body,
  });

  return {
    collection: collectionUri,
    type: 'https://www.w3.org/ns/activitystreams#Offer',
    createdAt: '',
    from: context.solidService.getDefaultSession().info.webId,
    to: target,
    uri: response.headers.get('Location'),
  };

};

/**
 * Loads and returns all incoming loan requests for a heritage institution
 */
export const loadRequests = async (context: LoanContext, event: LoanEvent): Promise<LoanRequest[]> => {

  return [ {
    uri: 'https://crs.crs',
    type: 'https://www.w3.org/ns/activitystreams#Offer',
    collection: 'https://belgiannoise.solidcommunity.net/heritage-collections/catalog#collection-b922b0d8-ac42-4742-92da-a3e6706db07f',
    createdAt: Date.now().toString(),
    from: 'https://from.id',
    to: 'https://belgiannoise.solidcommunity.net/profile/card#me',
    description: 'test',
  },
  {
    uri: 'https://crs.crs',
    type: 'https://www.w3.org/ns/activitystreams#Accept',
    collection: 'https://belgiannoise.solidcommunity.net/heritage-collections/catalog#collection-b922b0d8-ac42-4742-92da-a3e6706db07f',
    createdAt: Date.now().toString(),
    from: 'https://from.id',
    to: 'https://belgiannoise.solidcommunity.net/profile/card#me',
    description: 'test',
  } ];

  // eslint-disable-next-line no-console
  console.log('Loading Requests');

  const webId = context.solidService.getDefaultSession().info.webId;

  // get all unique inboxes
  const inboxUris = [
    ...new Set((await context.collectionStore.all())
      .filter((collection) => collection.publisher === webId)
      .map((collection) => collection.inbox)).values(),
  ];

  // retrieve notifications from all inboxes
  const loanRequests: LoanRequest[] = [];

  for (const uri of inboxUris) {

    // get content of inbox
    const dataset = await getSolidDataset(uri);
    const inboxThing = getThing(dataset, uri);

    const notificationUris = getUrlAll(inboxThing, 'http://www.w3.org/ns/ldp#contains');

    const notificationThings: Thing[] = [];

    for (const notificationUri of notificationUris) {

      const notificationDataset = await getSolidDataset(
        notificationUri,
        { fetch: context.solidService.getDefaultSession().fetch }
      );

      const notificationThing = getThing(notificationDataset, notificationUri,);

      notificationThings.push(notificationThing);

    }

    const loanRequestTypes: string[] = [
      'https://www.w3.org/ns/activitystreams#Offer',
      'https://www.w3.org/ns/activitystreams#Accept',
      'https://www.w3.org/ns/activitystreams#Reject',
    ];

    // filter for loan requests
    const loanRequestThings: Thing[] = notificationThings.filter((thing) =>
      !!thing && loanRequestTypes.includes(getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')));

    const parsedLoanRequests: LoanRequest[] = loanRequestThings.map((thing) => ({
      uri: asUrl(thing) ?? undefined,
      type: getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') as any ?? undefined,
      collection: getUrl(thing, 'https://www.w3.org/ns/activitystreams#object') ?? undefined,
      to: getUrl(thing, 'https://www.w3.org/ns/activitystreams#target') ?? undefined,
      from: getUrl(thing, 'https://www.w3.org/ns/activitystreams#actor') ?? undefined,
      createdAt: '',
    }));

    loanRequests.push(... parsedLoanRequests);

  }

  return loanRequests;

};

/**
 * Sends the original request with { accepted: true } to the requesting institution's inbox
 * to let them know the request has been accepted.
 * This also changes the request in the inbox of the receiving institution to contain { accepted: true }
 *
 * @param loanRequest the loanRequest to be accepted
 * @returns the original loan request on success
 */
export const acceptRequest = async (context: LoanContext, event: LoanEvent): Promise<LoanRequest> => {

  // eslint-disable-next-line no-console
  console.log('Accept Request');

  if (!(event instanceof ClickedAcceptedLoanRequestEvent)) {

    throw new Error('event is not of type ClickedAcceptedLoanRequestEvent');

  }

  // eslint-disable-next-line no-console
  console.log('Sending loan request rejection notif');

  // retrieve response inbox location
  // use the requester's catalog inbox as target for responses
  const catalogUri = await context.collectionStore.getInstanceForClass(event.loanRequest.from, 'http://schema.org/DataCatalog');
  const catalogDataset = await getSolidDataset(catalogUri);
  const catalogThing = getThing(catalogDataset, catalogUri);
  const targetInbox = getUrl(catalogThing, 'http://www.w3.org/ns/ldp#inbox');

  const notificationId = v4();

  const body = createNotificationBody({
    inbox: targetInbox,
    notificationId,
    type: 'https://www.w3.org/ns/activitystreams#Accept',
    summary: 'Bruikleen aanvraag geaccepteerd',
    actor: context.loanRequest.to,
    target: context.loanRequest.from,
    object: context.loanRequest.collection,
  });

  const response = await fetch(targetInbox, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
      'Slug': notificationId,
    },
    body,
  });

  return {
    collection: context.loanRequest.collection,
    type: 'https://www.w3.org/ns/activitystreams#Accept',
    createdAt: '',
    from: context.loanRequest.to,
    to: context.loanRequest.from,
    uri: response.headers.get('Location'),
  };

};

/**
 * Sends the original request with { accepted: false } to the requesting institution's inbox
 * to let them know the request has been rejected.
 * This also changes the request in the inbox of the receiving institution to contain { accepted: false }
 *
 * @param loanRequest the loanRequest to be rejected
 * @returns the original loan request on success
 */
export const rejectRequest = async (context: LoanContext, event: LoanEvent): Promise<LoanRequest> => {

  // eslint-disable-next-line no-console
  console.log('Reject Request');

  if (!(event instanceof ClickedRejectedLoanRequestEvent)) {

    throw new Error('event is not of type ClickedRejectedLoanRequestEvent');

  }

  // eslint-disable-next-line no-console
  console.log('Sending loan request rejection notif');

  // retrieve response inbox location
  // use the requester's catalog inbox as target for responses
  const catalogUri = await context.collectionStore.getInstanceForClass(event.loanRequest.from, 'http://schema.org/DataCatalog');
  const catalogDataset = await getSolidDataset(catalogUri);
  const catalogThing = getThing(catalogDataset, catalogUri);
  const targetInbox = getUrl(catalogThing, 'http://www.w3.org/ns/ldp#inbox');

  const notificationId = v4();

  const body = createNotificationBody({
    inbox: targetInbox,
    notificationId,
    type: 'https://www.w3.org/ns/activitystreams#Reject',
    summary: 'Bruikleen aanvraag geweigerd',
    actor: context.loanRequest.to,
    target: context.loanRequest.from,
    object: context.loanRequest.collection,
  });

  const response = await context.solidService.getDefaultSession().fetch(targetInbox, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
      'Slug': notificationId,
    },
    body,
  });

  return {
    collection: context.loanRequest.collection,
    type: 'https://www.w3.org/ns/activitystreams#Reject',
    createdAt: '',
    from: context.loanRequest.to,
    to: context.loanRequest.from,
    uri: response.headers.get('Location'),
  };

};
