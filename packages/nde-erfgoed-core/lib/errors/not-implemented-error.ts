import { BaseError } from './base-error';

/**
 * An error thrown when a function is called with invalid arguments.
 */
export class NotImplementedError extends BaseError {
  public readonly name = NotImplementedError.name;

  /**
   * Instantiates the error.
   *
   * @param message A message which describes the error.
   * @param value The value of the invalid argument.
   * @param cause The underlying error.
   */
  constructor(cause?: Error) {
    super('Not implemented', cause);

    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}
