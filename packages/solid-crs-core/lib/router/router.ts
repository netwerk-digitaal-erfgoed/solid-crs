import { EventObject } from 'xstate';
import { ArgumentError } from '../errors/argument-error';

/**
 * Route definition for use in the router
 */
export interface Route {

  /**
   * The path matcher e.g. '/object/{{objectId}}/edit'
   */
  path: string;

  /**
   * The target state(s) of this route (likely some feature state)
   */
  targets: string[];

  /**
   * The document.title of this route
   * When set, router will update document.title to this value
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
export const matchPath = (match: string): boolean => {

  // !path also checks empty strings, which are allowed here
  if (match === undefined || match === null) {

    throw new ArgumentError('Argument path should be set.', match);

  }

  const regex = new RegExp(`^${match.replace(/{{[^/]+}}/ig, '(.+)')}$`, 'i');

  return window.location.pathname.match(regex)?.length > 0;

};

/**
 * Returns the currently active route base on window.location.pathname
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

/**
 * Updates the document's title
 *
 * @param title The new page title
 */
export const updateTitle = (title: string): string => {

  document.title = title;

  return undefined;

};

/**
 * Updates the path in the URL bar
 *
 * @param path The new value for the path
 * @param title Optional, the new document title
 */
export const updateHistory = (path: string, title?: string): void => {

  // keep hash and query parameters
  const completePath = path + window.location.search + window.location.hash;

  if (path === window.location.pathname) {

    history.replaceState({}, title||'', completePath);

  } else {

    history.pushState({}, title||'', completePath);

  }

  if (title) updateTitle(title);

};

/**
 * State references for the application's features, with readable log format.
 */
export enum RouterStates {
  IDLE = '[RouterStates: Idle]',
  NAVIGATING = '[RouterStates: Navigating]',
}

/**
 * State key for the router
 */
export const ROUTER = '[AppState: Router]';

/**
 * StateNodeConfig for the router
 * Resolves URL path to a state
 */
export const routerStateConfig = (routes: Route[]) => ({
  [ROUTER]: {
    initial: RouterStates.IDLE,
    states: {
      [RouterStates.IDLE]: {
        id: RouterStates.IDLE,
      },
      [RouterStates.NAVIGATING]: {
        id: RouterStates.NAVIGATING,
        invoke: {
          src: async () => Promise.resolve(),
          onDone: {
            target: [ RouterStates.IDLE, ...activeRoute(routes).targets ],
            actions: [
              () => {

                const route = activeRoute(routes);

                if (route.title) {

                  updateTitle(route.title);

                }

              },
            ],
          },
        },
      },
    },
  },
});

/**
 * Event references for the router, with readable log format.
 */
export enum RouterEvents {
  NAVIGATE = '[AppEvent: Navigate]',
  NAVIGATED = '[AppEvent: Navigated]',
}

/**
 * An event which is dispatched when routing should start
 */
export class NavigateEvent implements EventObject {

  public type: RouterEvents.NAVIGATE = RouterEvents.NAVIGATE;
  constructor(public path?: string) { }

}

/**
 * An event which is dispatched at the end of routing
 */
export class NavigatedEvent implements EventObject {

  public type: RouterEvents.NAVIGATED = RouterEvents.NAVIGATED;
  constructor(public path: string, public title?: string) { }

}

/**
 * Union type of router events.
 */
export type RouterEvent = NavigateEvent | NavigatedEvent;
