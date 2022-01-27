import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import * as services from './loan.services';

const mockLoanRequest: LoanRequest = {
  uri: 'https://loan.uri',
  from: 'https://send.webid',
  to: 'https://receiver.webid',
  createdAt: Date.now().toString(),
  collection: 'https://collection.uri',
};

describe('LoanServices', () => {

  describe('createRequest', () => {

    it('should return the original request on success', async () => {

      await expect(services.createRequest(mockLoanRequest)).resolves.toEqual(mockLoanRequest);

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
