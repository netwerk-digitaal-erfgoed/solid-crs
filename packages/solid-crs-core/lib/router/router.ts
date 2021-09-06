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
 * Checks the window.location.pathname against a given path
 * Path should be a full match
 *
 * @param match The path of the route to match
 * @returns true when path matches, otherwise false
 */
export const matchPath = (match: string, currentPath: string): boolean => {

  // !path also checks empty strings, which are allowed here
  if (match === undefined || match === null) {

    throw new ArgumentError('Argument path should be set.', match);

  }

  const regex = new RegExp(`^${match.replace(/{{[^/]+}}/ig, '(.+)')}$`, 'i');

  return currentPath.match(regex)?.length > 0;

};

/**
 * Returns the currently active route base on window.location.pathname
 *
 * @param routes A list of all routes
 * @returns The currently active route
 */
export const activeRoute = (routes: Route[], currentPath: string): Route => {

  if (!routes || routes.length < 1) {

    throw new ArgumentError('Argument routes should be set.', routes);

  }

  return routes.find((route) => matchPath(route.path, currentPath));

};

/**
 * For a given path, returns the URL variables as a Map
 *
 * @param path The path structure with variable names
 */
export const urlVariables = (path: string): Map<string, string> => {

  const regex = new RegExp(`^${path.replace(/{{[^/]+}}/ig, '(.+)')}$`, 'i');

  const parts = path.split('/')
    .filter((part) => part.startsWith('{{') && part.endsWith('}}'));

  const matches = (window.location.pathname.match(regex)||[]).splice(1);

  // this check might not be necessary
  if (matches.length !== parts.length) {

    throw new ArgumentError('No match for every variable', { parts, matches });

  }

  const variables = new Map();
  const variableNames = parts.map((part) => part.substring(2, part.length - 2));

  variableNames.forEach((variable, i) => {

    variables.set(variable, matches[i]);

  });

  return variables;

};
