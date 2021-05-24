/**
 * Debounce a function.
 *
 * @param func Function to debounce.
 * @param wait Timeout in milliseconds.
 * @param immediate Ignores the timeout.
 * @returns The debounced function.
 */
export const debounce = (func: () => void, wait: number, immediate = false) => {

  let timeout: NodeJS.Timeout;

  return function() {

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    // The arguments of the original function.
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;

    // Resets the timeout.
    clearTimeout(timeout);

    // Executes the function after a timeout.
    timeout = setTimeout(() => {

      timeout = null;

      if (!immediate) {

        func.apply(context, args);

      }

    }, wait);

    // Don't wait for timer if immidiate.
    if (immediate && !timeout) {

      func.apply(context, args);

    }

  };

};
