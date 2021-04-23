/**
 * Represents a translation of a string in a specific locale.
 */
export interface Translation {
  /**
   * The locale of the translation.
   */
  locale: string;

  /**
   * The key of the translation.
   */
  key: string;

  /**
   * The value of the translation.
   */
  value: string;
}
