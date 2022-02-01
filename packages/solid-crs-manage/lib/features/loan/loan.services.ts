import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { LoanRequestCreationArgs } from './models/loan-request-creation-args';

/**
 * Sends a new LoanRequest as LDN to a heritage institution
 *
 * @param loanRequest the loanRequest to create / send
 * @returns the given loanRequest when creation was successful
 */
export const createRequest = async (loanRequestCreationArgs: LoanRequestCreationArgs): Promise<LoanRequest> => {

  // eslint-disable-next-line no-console
  console.log('Creating Request');

  return {
    ...loanRequestCreationArgs,
  } as any;

};

/**
 * Loads and returns all incoming loan requests for a heritage institution
 */
export const loadRequests = async (): Promise<LoanRequest[]> => {

  // eslint-disable-next-line no-console
  console.log('Loading Requests');

  const mockLoanRequest1: LoanRequest = {
    uri: 'https://loan.uri.one',
    from: 'https://send.webid.one',
    to: 'https://receiver.webid.one',
    createdAt: Date.now().toString(),
    collection: 'https://collection.uri.one',
    description: 'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
  };

  const mockLoanRequest2: LoanRequest = {
    uri: 'https://loan.uri.two',
    from: 'https://send.webid.two',
    to: 'https://receiver.webid.two',
    createdAt: Date.now().toString(),
    collection: 'https://collection.uri.two',
  };

  return [ mockLoanRequest1,
    mockLoanRequest2,
    mockLoanRequest2,
    mockLoanRequest2,
    mockLoanRequest2,
    mockLoanRequest2,
    mockLoanRequest1 ];

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
