import { Logger } from './Logger';

/**
 * Base error class for all ElProfessor errors.
 *
 * Provides additional context such as an error code and HTTP status code
 * to allow for more structured error handling.
 */
export class ElProfessorError extends Error {
  /** Unique error code identifier. */
  public readonly code: string;

  /** Associated HTTP status code for the error. */
  public readonly statusCode: number;

  /**
   * Creates a new ElProfessorError.
   *
   * @param message - Human-readable error message.
   * @param code - Unique error code (default: 'UNKNOWN_ERROR').
   * @param statusCode - HTTP status code (default: 500).
   */
  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'ElProfessorError';
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when there is a configuration-related issue.
 * Example: missing environment variables or invalid settings.
 */
export class ConfigurationError extends ElProfessorError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 400);
    this.name = 'ConfigurationError';
  }
}

/**
 * Error thrown when a connection to an MCP server fails.
 */
export class MCPConnectionError extends ElProfessorError {
  constructor(message: string, serverName: string) {
    super(`MCP Server '${serverName}': ${message}`, 'MCP_CONNECTION_ERROR', 503);
    this.name = 'MCPConnectionError';
  }
}

/**
 * Error thrown when there is an issue with Generative AI services.
 * Example: rate limits, timeouts, or upstream service failures.
 */
export class GenAIError extends ElProfessorError {
  constructor(message: string) {
    super(message, 'GENAI_ERROR', 502);
    this.name = 'GenAIError';
  }
}

/**
 * Centralized error handler utility for logging and managing errors.
 *
 * Supports:
 * - Logging structured error messages with context.
 * - Wrapping sync/async operations to catch and log errors automatically.
 * - Identifying retryable errors for resiliency.
 */
export class ErrorHandler {
  private static logger = Logger.getInstance();

  /**
   * Handles and logs an error with optional context.
   *
   * @param error - The error instance to handle.
   * @param context - Optional context string (e.g., function or operation name).
   */
  public static handle(error: Error | ElProfessorError, context?: string): void {
    const contextMessage = context ? ` in ${context}` : '';

    if (error instanceof ElProfessorError) {
      this.logger.error(`${error.name}${contextMessage}: ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      });
    } else {
      this.logger.error(`Unexpected error${contextMessage}: ${error.message}`, {
        stack: error.stack,
      });
    }
  }

  /**
   * Wraps an asynchronous operation in a try/catch block,
   * automatically handling any errors that occur.
   *
   * @param operation - The async function to execute.
   * @param context - Optional context string for logging.
   * @returns The result of the operation, or `null` if it fails.
   */
  public static async handleAsync<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  /**
   * Wraps a synchronous operation in a try/catch block,
   * automatically handling any errors that occur.
   *
   * @param operation - The function to execute.
   * @param context - Optional context string for logging.
   * @returns The result of the operation, or `null` if it fails.
   */
  public static wrap<T>(operation: () => T, context?: string): T | null {
    try {
      return operation();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  /**
   * Determines if an error is retryable.
   *
   * Retryable errors include:
   * - `MCPConnectionError`
   * - `GenAIError` containing rate limit, timeout, or service unavailable messages
   *
   * @param error - The error to evaluate.
   * @returns True if the error is retryable, otherwise false.
   */
  public static isRetryableError(error: Error): boolean {
    if (error instanceof MCPConnectionError) {
      return true;
    }

    if (error instanceof GenAIError) {
      return (
        error.message.includes('rate limit') ||
        error.message.includes('timeout') ||
        error.message.includes('service unavailable')
      );
    }

    return false;
  }
}
