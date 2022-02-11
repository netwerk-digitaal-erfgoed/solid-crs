import { asUrl, getSolidDataset, getThingAll, getUrl, Thing } from '@digita-ai/inrupt-solid-client';
import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { v4 } from 'uuid';
import { LoanContext } from './loan.context';
import { ClickedSendLoanRequestEvent, LoanEvent } from './loan.events';

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
  } = await context.collectionStore.get(event.loanRequest.collection);

  //

  const body = `@prefix as: <https://www.w3.org/ns/activitystreams#> .

<${targetInbox}>
  a as:Offer ;
  as:summary "Bruikleen aanvraag" ;
  as:actor <${context.solidService.getDefaultSession().info.webId}> ;
  as:target <${target}> ;
  as:object <${collectionUri}> ;
  as:origin <${process.env.VITE_WEBID_URI}collectiebeheersysteem> .
`;

  const response = await context.solidService.getDefaultSession().fetch(targetInbox, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
      'Slug': v4(),
    },
    body,
  });

  return {
    ...event.loanRequest,
    uri: response.headers.get('Location'),
  };

};

/**
 * Loads and returns all incoming loan requests for a heritage institution
 */
export const loadRequests = async (context: LoanContext, event: LoanEvent): Promise<LoanRequest[]> => {

  // eslint-disable-next-line no-console
  console.log('Loading Requests');

  // get all unique inboxes
  const inboxUris = [
    ...new Set((await context.collectionStore.all()).map((collection) => collection.inbox)).values(),
  ];

  // retrieve notifications from all inboxes
  const loanRequests: LoanRequest[] = [];

  for (const uri of inboxUris) {

    // get content of inbox
    const dataset = await getSolidDataset(uri);
    const notificationThings = getThingAll(dataset);

    const loanRequestTypes: string[] = [
      'https://www.w3.org/ns/activitystreams#Offer',
    ];

    // filter for loan requests
    const loanRequestThings: Thing[] = notificationThings.filter((thing) =>
      getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#') in loanRequestTypes);

    const parsedLoanRequests: LoanRequest[] = loanRequestThings.map((thing) => ({
      uri: asUrl(thing) ?? undefined,
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
export const acceptRequest = async (loanRequest: LoanRequest): Promise<LoanRequest> => {

  // eslint-disable-next-line no-console
  console.log('Accept Request');

  return loanRequest;

};

/**
 * Sends the original request with { accepted: false } to the requesting institution's inbox
 * to let them know the request has been rejected.
 * This also changes the request in the inbox of the receiving institution to contain { accepted: false }
 *
 * @param loanRequest the loanRequest to be rejected
 * @returns the original loan request on success
 */
export const rejectRequest = async (loanRequest: LoanRequest): Promise<LoanRequest> => {

  // eslint-disable-next-line no-console
  console.log('Reject Request');

  return loanRequest;

};
