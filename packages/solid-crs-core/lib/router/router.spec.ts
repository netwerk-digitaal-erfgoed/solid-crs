import { matchPath, activeRoute, Route } from './router';

describe('Router', () => {

  delete window.location;
  (window.location as any) = new URL('http://localhost/test/12345/testing');

  describe('matchPath', () => {

    it('should error when path is falsey', () => {

      expect(() => matchPath(undefined)).toThrow();
      expect(() => matchPath(null)).toThrow();

    });

    it('should return true when path matches window.location', () => {

      expect(matchPath('/test/12345/testing')).toBeTruthy();
      expect(matchPath('/test/{{numbers}}/testing')).toBeTruthy();
      expect(matchPath('/{{partOne}}/{{numbers}}/{{partTwo}}')).toBeTruthy();
      expect(matchPath('/{{partOne}}/.*')).toBeTruthy();

    });

    it('should return false when path does not match window.location', () => {

      expect(matchPath('/test')).toBeFalsy();
      expect(matchPath('/test/testing')).toBeFalsy();
      expect(matchPath('')).toBeFalsy();

    });

  });

  describe('activeRoute', () => {

    it('should error when routes is undefined or empty', () => {

      expect(() => activeRoute(undefined)).toThrow();
      expect(() => activeRoute(null)).toThrow();
      expect(() => activeRoute([])).toThrow();

    });

    it('should return first matching path', () => {

      const routes: Route[] = [
        { path: '/test/12345/testing', targets: [] },
        { path: '/test/{{numbers}}/testing', targets: [] },
      ];

      expect(activeRoute(routes)).toEqual(routes[0]);

    });

    it('should return undefined when no match is found', () => {

      const routes: Route[] = [
        { path: '/test/testing', targets: [] },
        { path: '/test', targets: [] },
      ];

      expect(activeRoute(routes)).toEqual(undefined);

    });

  });

});
