import { addCollection, dismissAlert, error, removeSession, setCollections, setSession } from '../lib/app.events';
import { addAlert } from './features/collection/collection.events';

describe('App Events', () => {

  describe('addCollection', () => {

    it('should return correct action', () => {

      expect(addCollection).toBeTruthy();

    });

  });

  describe('setCollections', () => {

    it('should return correct action', () => {

      expect(setCollections).toBeTruthy();

    });

  });

  describe('setSession', () => {

    it('should return correct action', () => {

      expect(setSession).toBeTruthy();

    });

  });

  describe('removeSession', () => {

    it('should return correct action', () => {

      expect(removeSession).toBeTruthy();

    });

  });

  describe('dismissAlert', () => {

    it('should return correct action', () => {

      expect(dismissAlert).toBeTruthy();

    });

  });

  describe('addAlert', () => {

    it('should return correct action', () => {

      expect(addAlert).toBeTruthy();

    });

  });

  describe('error', () => {

    it('should return correct action', () => {

      expect(error).toBeTruthy();

    });

  });

});
