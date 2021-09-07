import { matchPath, activeRoute, Route, urlVariables, updateHistory, updateTitle, routerStateConfig, ROUTER, RouterStates } from './router';

describe('Router', () => {

  delete window.location;
  (window.location as any) = new URL('http://localhost/test/12345/testing');

  const path = '/test-path';
  const differentPath = '/other-test-path';
  const title = 'Title | Test';

  describe('matchPath', () => {

    it('should error when path is falsey', () => {

      expect(() => matchPath(undefined)).toThrow('Argument path should be set.');
      expect(() => matchPath(null)).toThrow('Argument path should be set.');

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
      expect(matchPath('/test/12345//testing')).toBeFalsy();
      expect(matchPath('')).toBeFalsy();

    });

  });

  describe('activeRoute', () => {

    it('should error when routes is undefined or empty', () => {

      expect(() => activeRoute(undefined)).toThrow('Argument routes should be set.');
      expect(() => activeRoute(null)).toThrow('Argument routes should be set.');
      expect(() => activeRoute([])).toThrow('Argument routes should be set.');

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

  describe('urlVariables', () => {

    it('should return a correct map of URL variables', () => {

      // window.location.pathname = '/test/12345/testing'
      const resultMap = urlVariables('/{{partOne}}/{{numbers}}/{{partTwo}}');

      expect(resultMap.get('partOne')).toEqual('test');
      expect(resultMap.get('numbers')).toEqual('12345');
      expect(resultMap.get('partTwo')).toEqual('testing');

    });

    it('should error when no match was found for every variable', () => {

      // usually happens when an invalid path was provided (here: double slashes)
      // or when the regex is made incorrect matches (should not happen)
      expect(() => urlVariables('/{{partOne}}//{{numbers}}/{{partTwo}}')).toThrow('No match for every variable');

    });

  });

  describe('updateHistory', () => {

    beforeEach(() => {

      delete window.location;
      (window.location as any) = new URL(`http://localhost${path}`);
      history.replaceState = jest.fn();
      history.pushState = jest.fn();

    });

    it('should call replaceState when path matches current URL', () => {

      updateHistory(path, title);
      expect(history.replaceState).toHaveBeenCalledWith({}, title, path);

    });

    it('should call replaceState with empty title when title is not set', () => {

      updateHistory(path, '');
      expect(history.replaceState).toHaveBeenCalledWith({}, '', path);

    });

    it('should call pushState when path is different from current URL', () => {

      updateHistory(differentPath, title);
      expect(history.pushState).toHaveBeenCalledWith({}, title, differentPath);

    });

    it('should call pushState with empty title when title is not set', () => {

      updateHistory(differentPath, '');
      expect(history.pushState).toHaveBeenCalledWith({}, '', differentPath);

    });

  });

  describe('updateTitle', () => {

    it('should set document.title', () => {

      document.title = '';
      expect(document.title).toEqual('');
      updateTitle(title);
      expect(document.title).toEqual(title);

    });

  });

  describe('routerStateConfig', () => {

    const routes: Route[] = [
      {
        path,
        targets: [ 'target' ],
      },
    ];

    it('invoke.src should always resolve', async () => {

      const config = routerStateConfig(routes);

      expect(config[ROUTER].states[RouterStates.NAVIGATING].invoke.src())
        .resolves.toEqual(undefined);

    });

    it('invoke.onDone should contain correct target and actions', () => {

      delete window.location;
      (window.location as any) = new URL(`http://localhost${path}`);
      const config = routerStateConfig(routes);

      expect(config[ROUTER].states[RouterStates.NAVIGATING].invoke.onDone.target)
        .toEqual(activeRoute(routes).targets);

      expect(config[ROUTER].states[RouterStates.NAVIGATING].invoke.onDone.actions[0]())
        .toEqual(updateTitle(activeRoute(routes).title));

    });

  });

});