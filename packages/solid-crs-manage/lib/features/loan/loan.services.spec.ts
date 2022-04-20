import { Collection, LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import fetchMock from 'jest-fetch-mock';
import * as sdk from '@digita-ai/inrupt-solid-client';
import { LoanContext } from './loan.context';
import { ClickedAcceptedLoanRequestEvent, ClickedImportCollection, ClickedLoanRequestDetailEvent, ClickedRejectedLoanRequestEvent, ClickedSendLoanRequestEvent, LoanEvent } from './loan.events';
import * as services from './loan.services';
import { LoanRequestCreationArgs } from './models/loan-request-creation-args';

const mockLoanRequest: LoanRequest = {
  uri: 'https://loan.uri/',
  from: 'https://send.uri/',
  to: 'https://receiver.uri/',
  createdAt: '',
  collection: 'https://collection.uri/',
  type: 'https://www.w3.org/ns/activitystreams#Offer',
};

const mockCreationArgs: LoanRequestCreationArgs = {
  collection: mockLoanRequest.collection,
  description: mockLoanRequest.description,
};

const mockCollection: Collection = {
  name: 'mockCollection',
  description: 'https://description.uri/',
  inbox: 'https://publiinboxsher.uri/',
  publisher: 'https://web.id/',
  uri: 'https://collection.uri/',
  distribution: 'https://distribution.uri/',
} as any;

const mockContext: LoanContext = {
  loanRequest: mockLoanRequest,
  solidService: {
    getDefaultSession: jest.fn(() => ({
      fetch,
      info: {
        sessionId: 'test-id',
        webId: 'https://web.id/',
      },
    })),
  } as any,
  collectionStore: {
    all: jest.fn(async () => ([ mockCollection ])),
    get: jest.fn(async () => mockCollection),
    getInstanceForClass: jest.fn(async () => 'https://catalog.uri/'),
    save: jest.fn(async () => (mockCollection)),
  } as any,
  objectStore: {
    getObjectsForCollection: jest.fn(async () => [
      {
        uri: 'https://inbox.uri/',
      },
    ]),
    save: jest.fn(async () => ({})),
  } as any,
};

describe('LoanServices', () => {

  fetchMock.enableMocks();

  describe('createRequest', () => {

    const mockEvent = new ClickedSendLoanRequestEvent(mockCreationArgs);

    it('should return the original request on success', async () => {

      fetchMock.mockOnce(async () => ({
        status: 200,
        headers: {
          'Location': 'https://notification.uri/',
        },
      }));

      await expect(services.createRequest(mockContext, mockEvent))
        .resolves.toEqual({
          ... mockLoanRequest,
          uri: 'https://notification.uri/',
          from: 'https://web.id/',
          to: 'https://web.id/',
        });

    });

    it('should error if event if not ClickedSendLoanRequestEvent', async () => {

      await expect(services.createRequest(mockContext, new ClickedAcceptedLoanRequestEvent([])))
        .rejects.toThrow('event is not of type ClickedSendLoanRequestEvent');

    });

  });

  describe('loadRequests', () => {

    it('should load notifications', async () => {

      (sdk.getSolidDataset as any) = jest.fn(async () => ({}));
      (sdk.getThing as any) = jest.fn(() => 'thing');

      (sdk.getUrlAll as any) = jest.fn(() => [
        'https://notification.uri/',
        'https://notification.uri/',
        'https://notification.uri/',
      ]);

      (sdk.getUrl as any) = jest.fn((thing, predicate) => predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' ? 'https://www.w3.org/ns/activitystreams#Offer' : 'https://any.uri/');
      (sdk.asUrl as any) = jest.fn(() => 'https://notification.uri/');

      const result = await services.loadRequests(mockContext, new ClickedLoanRequestDetailEvent(mockLoanRequest));

      expect(result).toHaveLength(3);

      expect(result).toContainEqual(expect.objectContaining({
        uri: 'https://notification.uri/',
        type: 'https://www.w3.org/ns/activitystreams#Offer',
        collection: 'https://any.uri/',
        to: 'https://any.uri/',
        from: 'https://any.uri/',
        createdAt: '',
      }));

    });

  });

  describe('acceptRequest', () => {

    it('should return the original LoanRequest on accept', async () => {

      (sdk.getSolidDataset as any) = jest.fn(async () => ({}));
      (sdk.getThing as any) = jest.fn(() => ({}));
      (sdk.getUrl as any) = jest.fn((thing, predicate) => predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' ? 'https://www.w3.org/ns/activitystreams#Offer' : 'https://any.uri/');

      fetchMock.mockOnce(async () => ({
        status: 200,
        headers: {
          'Location': 'https://notification.uri/',
        },
      }));

      await expect(services.acceptRequest(mockContext, new ClickedAcceptedLoanRequestEvent(mockLoanRequest)))
        .resolves.toEqual({
          ... mockLoanRequest,
          uri: 'https://notification.uri/',
          from: 'https://receiver.uri/',
          to: 'https://send.uri/',
          type: 'https://www.w3.org/ns/activitystreams#Accept',
        });

    });

    it('should error when event is not ClickedAcceptedLoanRequestEvent', async () => {

      await expect(services.acceptRequest(mockContext, new ClickedRejectedLoanRequestEvent(mockLoanRequest)))
        .rejects.toThrow('event is not of type ClickedAcceptedLoanRequestEvent');

    });

  });

  describe('rejectRequest', () => {

    it('should return the original LoanRequest on reject', async () => {

      (sdk.getSolidDataset as any) = jest.fn(async () => ({}));
      (sdk.getThing as any) = jest.fn(() => ({}));
      (sdk.getUrl as any) = jest.fn((thing, predicate) => predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' ? 'https://www.w3.org/ns/activitystreams#Offer' : 'https://any.uri/');

      fetchMock.mockOnce(async () => ({
        status: 200,
        headers: {
          'Location': 'https://notification.uri/',
        },
      }));

      await expect(services.rejectRequest(mockContext, new ClickedRejectedLoanRequestEvent(mockLoanRequest)))
        .resolves.toEqual({
          ... mockLoanRequest,
          uri: 'https://notification.uri/',
          from: 'https://receiver.uri/',
          to: 'https://send.uri/',
          type: 'https://www.w3.org/ns/activitystreams#Reject',
        });

    });

    it('should error when event is not ClickedAcceptedLoanRequestEvent', async () => {

      await expect(services.rejectRequest(mockContext, new ClickedAcceptedLoanRequestEvent(mockLoanRequest)))
        .rejects.toThrow('event is not of type ClickedRejectedLoanRequestEvent');

    });

  });

  describe('importCollection', () => {

    it('should error when event not of ClickedImportCollection type', async () => {

      await expect(services.importCollection(mockContext, {} as LoanEvent))
        .rejects.toThrow('Event is not of type ClickedImportCollection');

    });

    it('should return imported Collection', async () => {

      await expect(services.importCollection(mockContext, new ClickedImportCollection(mockCollection)))
        .resolves.toEqual(mockCollection);

    });

  });

});
