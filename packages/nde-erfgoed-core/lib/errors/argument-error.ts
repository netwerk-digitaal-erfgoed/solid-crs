import { BaseError } from './base-error';

/**
 * An error thrown when a function is called with invalid arguments.
 */
export class ArgumentError extends BaseError {

  public readonly name = ArgumentError.name;

  /**
   * Instantiates the error.
   *
   * @param message A message which describes the error.
   * @param value The value of the invalid argument.
   * @param cause The underlying error.
   */
  constructor(message: string, public value: unknown, cause?: Error) {

    super(message, cause);

    Object.setPrototypeOf(this, ArgumentError.prototype);

  }

}
