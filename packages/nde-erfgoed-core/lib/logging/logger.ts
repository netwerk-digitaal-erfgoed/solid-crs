/* eslint-disable no-console -- this is a logger service */

import { ArgumentError } from '../errors/argument-error';
import { LoggerLevel } from './logger-level';

/**
 * An abstract definition of a logger.
 */
export abstract class Logger {

  /**
   * Instantiates the logger.
   *
   * @param minimumLevel The minimum level of a log to be printed.
   * @param minimumLevelPrintData The minimum level of a log for data to be printed.
   */
  constructor(
    protected readonly minimumLevel: LoggerLevel,
    protected readonly minimumLevelPrintData: LoggerLevel,
  ) {}

  /**
   * Logs an info message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  info(typeName: string, message: string, data?: unknown) {
    if (!typeName) {
      throw new ArgumentError('Typename should be set', typeName);
    }

    if (!message) {
      throw new ArgumentError('Message should be set', message);
    }

    this.log(LoggerLevel.info, typeName, message, data);
  }

  /**
   * Logs a debug message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  debug(typeName: string, message: string, data?: unknown) {
    if (!typeName) {
      throw new ArgumentError('Typename should be set', typeName);
    }

    if (!message) {
      throw new ArgumentError('Message should be set', message);
    }

    this.log(LoggerLevel.debug, typeName, message, data);
  }

  /**
   * Logs a warning message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  warn(typeName: string, message: string, data?: unknown) {
    if (!typeName) {
      throw new ArgumentError('Typename should be set', typeName);
    }

    if (!message) {
      throw new ArgumentError('Message should be set', message);
    }

    this.log(LoggerLevel.warn, typeName, message, data);
  }

  /**
   * Logs an error message
   *
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param error The error that was thrown
   * @param caught The error that was caught
   */
  error(typeName: string, message: string, error?: Error | unknown, caught?: unknown) {
    if (!typeName) {
      throw new ArgumentError('Typename should be set', typeName);
    }

    if (!message) {
      throw new ArgumentError('Message should be set', message);
    }

    this.log(LoggerLevel.error, typeName, message, { error, caught });
  }

  /**
   * Logs a message
   *
   * @param level Severity level of the log
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  abstract log(level: LoggerLevel, typeName: string, message: string, data?: unknown): void;

}
