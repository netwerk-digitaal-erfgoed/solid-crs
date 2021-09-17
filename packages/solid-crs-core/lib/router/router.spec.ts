import { matchPath, activeRoute, Route, urlVariables, updateHistory, updateTitle, routerStateConfig, ROUTER, RouterStates, NavigateEvent, NavigatedEvent, routerEventsConfig, RouterEvents } from './router';

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

      expect(activeRoute(routes)).toEqual(expect.objectContaining(routes[0]));

    });

    it('should error when no match is found', () => {

      const routes: Route[] = [
        { path: '/test/testing', targets: [] },
        { path: '/test', targets: [] },
      ];

      expect(() => activeRoute(routes)).toThrow('No route match found for this URL');

    });

  });

  describe('urlVariables', () => {

    const route: Route = {
      path: '/{{partOne}}/{{numbers}}/{{partTwo}}',
      targets: [],
    };

    beforeEach(() => {

      delete window.location;
      (window.location as any) = new URL('http://localhost/test/12345/testing?search=test#test');

    });

    it('should return a correct map of path params', () => {

      // window.location.pathname = '/test/12345/testing'
      const result = urlVariables(route);

      expect(result.pathParams.get('partOne')).toEqual('test');
      expect(result.pathParams.get('numbers')).toEqual('12345');
      expect(result.pathParams.get('partTwo')).toEqual('testing');

    });

    it('should return correct searchParams', () => {

      const result = urlVariables(route);
      expect(result.searchParams.get('search')).toEqual('test');

    });

    it('should return correct hash', () => {

      const result = urlVariables(route);
      expect(result.hash).toEqual('#test');

    });

    it('should return empty map when no path variable exists', () => {

      const routeWithoutParams: Route = {
        path: '/path/without/variables',
        targets: [],
      };

      expect(urlVariables(routeWithoutParams).pathParams.size).toEqual(0);

    });

    it('should error when no match was found for every variable', () => {

      const invalidRoute: Route = {
        path: '/{{partOne}}//{{numbers}}/{{partTwo}}',
        targets: [],
      };

      // usually happens when an invalid path was provided (here: double slashes)
      // or when the regex is made incorrect matches (should not happen)
      expect(() => urlVariables(invalidRoute)).toThrow('No match for every variable');

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

    it('should persist query parameters and hashes', () => {

      const queryPath = `${differentPath}?lang=en`;
      updateHistory(queryPath, '');
      expect(history.pushState).toHaveBeenCalledWith({}, '', queryPath);

      const hashPath = `${differentPath}#me`;
      updateHistory(hashPath, '');
      expect(history.pushState).toHaveBeenCalledWith({}, '', hashPath);

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
        title: 'test title',
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
        .toContain(activeRoute(routes).targets[0]);

      expect(config[ROUTER].states[RouterStates.NAVIGATING].invoke.onDone.actions[0]())
        .toEqual(updateTitle(activeRoute(routes).title));

      // dont update title when it is undefined in activeroute
      const routesWithoutTitle = routes.map((rte) => ({ path: rte.path, targets: rte.targets }));
      const configWithoutTitle = routerStateConfig(routesWithoutTitle);

      expect(configWithoutTitle[ROUTER].states[RouterStates.NAVIGATING].invoke.onDone.actions[0]())
        .toEqual(updateTitle(activeRoute(routesWithoutTitle).title));

    });

    it('invoke.onDone.target should always contain RouterStates.IDLE', () => {

      delete window.location;
      (window.location as any) = new URL(`http://localhost${path}`);
      const config = routerStateConfig(routes);

      expect(config[ROUTER].states[RouterStates.NAVIGATING].invoke.onDone.target)
        .toContain(RouterStates.IDLE);

    });

  });

  describe('NavigateEvent', () => {

    it('should create', () => {

      const event = new NavigateEvent(path);
      expect(event).toBeTruthy();
      expect(event.path).toEqual(path);

    });

  });

  describe('NavigatedEvent', () => {

    it('should create', () => {

      const event = new NavigatedEvent(path, title);
      expect(event).toBeTruthy();
      expect(event.path).toEqual(path);
      expect(event.title).toEqual(title);

    });

  });

  describe('routerEventsConfig', () => {

    it('should return NAVIGATE event config', () => {

      const result = routerEventsConfig();
      expect(result).toEqual(expect.objectContaining({ [RouterEvents.NAVIGATE]: expect.objectContaining({}) }));
      expect(result[RouterEvents.NAVIGATE].target).toContain(`#${RouterStates.NAVIGATING}`);
      expect((result[RouterEvents.NAVIGATE].actions[0].assignment as any).path(undefined, new NavigateEvent('path'))).toEqual('path');

      expect((result[RouterEvents.NAVIGATE].actions[0].assignment as any).path(undefined, new NavigateEvent()))
        .toEqual(window.location.pathname);

    });

    it('should return NAVIGATED event config', () => {

      const result = routerEventsConfig();
      expect(result).toEqual(expect.objectContaining({ [RouterEvents.NAVIGATED]: expect.objectContaining({}) }));
      expect(result[RouterEvents.NAVIGATED].actions[0](undefined, new NavigatedEvent('test', 'test'))).toEqual(undefined);

    });

  });

});
