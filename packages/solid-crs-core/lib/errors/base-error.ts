/**
 * A base error which takes a cause.
 */
export class BaseError extends Error {

  public readonly name = BaseError.name;

  /**
   * Instantiates an error.
   *
   * @param messsage Describes the error.
   * @param cause The underlying cause of the error.
   */
  constructor(messsage: string, public cause?: Error) {

    super(messsage);

    Object.setPrototypeOf(this, BaseError.prototype);

  }

}
