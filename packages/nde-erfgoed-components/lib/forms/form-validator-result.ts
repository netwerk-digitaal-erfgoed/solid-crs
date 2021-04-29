/**
 * Represents a result of a form validation.
 */
export interface FormValidatorResult {
  /**
   * The field which was validated.
   */
  field: string;

  /**
   * A message which indicate what's wrong.
   */
  message: string;
}
