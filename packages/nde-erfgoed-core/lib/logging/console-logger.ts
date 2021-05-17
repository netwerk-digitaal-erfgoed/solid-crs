/* eslint-disable no-console -- this is a logger service */

import { ArgumentError } from '../errors/argument-error';
import { Logger } from './logger';
import { LoggerLevel } from './logger-level';

/**
 * JavaScript console-based logger service
 */
export class ConsoleLogger extends Logger {

  /**
   * Instantiates the logger.
   *
   * @param minimumLevel The minimum level of a log to be printed.
   * @param minimumLevelPrintData The minimum level of a log for data to be printed.
   */
  constructor(
    protected readonly minimumLevel: LoggerLevel,
    protected readonly minimumLevelPrintData: LoggerLevel,
  ) {

    super(minimumLevel, minimumLevelPrintData);

  }

  /**
   * Logs a message
   *
   * @param level Severity level of the log
   * @param typeName The location of the log
   * @param message Message that should be logged
   * @param data Any relevant data that should be logged
   */
  log(level: LoggerLevel, typeName: string, message: string, data?: unknown): void {

    if (level === null || level === undefined) {

      throw new ArgumentError('level should be set', typeName);

    }

    if (!typeName) {

      throw new ArgumentError('typeName should be set', typeName);

    }

    if (!message) {

      throw new ArgumentError('message should be set', message);

    }

    const timestamp: string = new Date().toISOString();

    if (level <= this.minimumLevel) {

      const logMessage = `[${timestamp} ${typeName}] ${message}`;
      const logData = level >= this.minimumLevelPrintData ? '' : data||'';
      const log = [ logMessage, logData ];

      switch (level) {

        case LoggerLevel.info:
          console.info(...log);
          break;

        case LoggerLevel.debug:
          console.debug(...log);
          break;

        case LoggerLevel.warn:
          console.warn(...log);
          break;

        case LoggerLevel.error:
          console.error(...log);
          break;

        default:
          console.log(...log);
          break;

      }

    }

  }

}
