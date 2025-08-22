export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

/**
 * A singleton logger utility for structured console logging.
 * 
 * Supports different log levels (`ERROR`, `WARN`, `INFO`, `DEBUG`) and can be
 * configured via the environment variable `LOG_LEVEL` or programmatically using `setLogLevel`.
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  /**
   * Private constructor to enforce the singleton pattern.
   * Initializes log level from environment variables.
   */
  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
  }


  /**
   * Returns the singleton instance of the logger.
   * Creates a new one if it does not already exist.
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }


  /**
   * Reads the log level from the environment variable `LOG_LEVEL`.
   * Defaults to `INFO` if not set or invalid.
   */
  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  /**
   * Formats a log message with a timestamp, log level, and optional arguments.
   * 
   * @param level - The log level (e.g., "ERROR", "INFO").
   * @param message - The log message.
   * @param args - Additional data to log, objects are stringified.
   */
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ` ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}` : '';
    return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
  }

  /**
   * Logs an error message if the log level is set to `ERROR` or higher.
   */
  public error(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, ...args));
    }
  }

  /**
   * Logs a warning message if the log level is set to `WARN` or higher.
   */
  public warn(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, ...args));
    }
  }

  /**
   * Logs an informational message if the log level is set to `INFO` or higher.
   */
  public info(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', message, ...args));
    }
  }

  /**
   * Logs a debug message if the log level is set to `DEBUG`.
   */
  public debug(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, ...args));
    }
  }

  /**
   * Manually override the current log level.
   * 
   * @param level - New log level.
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}