import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import * as services from './loan.services';
import { LoanRequestCreationArgs } from './models/loan-request-creation-args';

const mockLoanRequest: LoanRequest = {
  uri: 'https://loan.uri',
  from: 'https://send.webid',
  to: 'https://receiver.webid',
  createdAt: Date.now().toString(),
  collection: 'https://collection.uri',
  description: 'desc',
};

const mockLoanRequestCreationArgs: LoanRequestCreationArgs = {
  collection: mockLoanRequest.collection,
  description: mockLoanRequest.description,
};

describe('LoanServices', () => {

  describe('createRequest', () => {

    it('should return the original request on success', async () => {

      await expect(services.createRequest(mockLoanRequestCreationArgs)).resolves.toEqual(mockLoanRequestCreationArgs);

    });

  });

  describe('loadRequests', () => {

    it('should ...', async () => {

      await expect(services.loadRequests()).resolves.toBeDefined();

    });

  });

  describe('acceptRequest', () => {

    it('should return the original LoanRequest on success', async () => {

      await expect(services.acceptRequest(mockLoanRequest)).resolves.toEqual(mockLoanRequest);

    });

  });

  describe('rejectRequest', () => {

    it('should return the original LoanRequest on success', async () => {

      await expect(services.rejectRequest(mockLoanRequest)).resolves.toEqual(mockLoanRequest);

    });

  });

});
