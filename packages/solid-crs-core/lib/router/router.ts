import { ArgumentError } from '../errors/argument-error';

/**
 * A Route defitinition for use in the xstate Router
 */
export interface Route {

  /**
   * The path matcher e.g. '/object/{{objectId}}/edit'
   */
  path: string;

  /**
   * The target state(s) of this route
   */
  targets: string[];

  /**
   * The document.title of this route
   */
  title?: string;
}

/**
 * Checks the window.location.href against a given path
 * Path should be a full match
 *
 * @param path The path of the route to match
 * @returns true when path matches, otherwise false
 */
export const matchPath = (path: string): boolean => {

  // !path also checks empty strings, which are allowed here
  if (path === undefined || path === null) {

    throw new ArgumentError('Argument path should be set.', path);

  }

  const regex = new RegExp(`^${path.replace(/{{[^/]+}}/ig, '(.*)')}$`, 'i');

  return window.location.pathname.match(regex)?.length > 0;

};

/**
 * Returns the currently active route
 *
 * @param routes A list of all routes
 * @returns The currently active route
 */
export const activeRoute = (routes: Route[]): Route => {

  if (!routes || routes.length < 1) {

    throw new ArgumentError('Argument routes should be set.', routes);

  }

  return routes.find((route) => matchPath(route.path));

};
