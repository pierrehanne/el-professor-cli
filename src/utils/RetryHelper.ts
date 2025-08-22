import { Logger } from './Logger';
import { ErrorHandler } from './ErrorHandler';

/**
 * Options controlling retry behavior for operations.
 */
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
}

/**
 * Helper utilities for retrying operations with backoff, jitter, and timeouts.
 */
export class RetryHelper {
  private static logger = Logger.getInstance();

  /**
   * Executes an async operation with configurable retries and exponential backoff.
   *
   * @typeParam T - The resolved type of the operation.
   * @param operation - Function returning a promise for the work to execute.
   * @param options - Partial override of retry options. Missing values use sensible defaults.
   * @param context - Optional context string (e.g., function name) included in logs.
   * @returns A promise that resolves to the operation result.
   * @throws Re-throws the last error if all attempts fail, or a non-retryable error immediately.
   *
   * @remarks
   * Defaults used when not provided in `options`:
   * - `maxAttempts`: 3
   * - `baseDelay`: 1000 ms
   * - `maxDelay`: 10000 ms
   * - `exponentialBase`: 2
   * - `jitter`: true
   *
   * Retryability is determined by `ErrorHandler.isRetryableError`.
   */
  public static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    context?: string
  ): Promise<T> {
    const config: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      exponentialBase: 2,
      jitter: true,
      ...options
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === config.maxAttempts) {
          break;
        }

        if (!ErrorHandler.isRetryableError(lastError)) {
          this.logger.debug(`Non-retryable error in ${context}, failing immediately`);
          throw lastError;
        }

        const delay = this.calculateDelay(attempt, config);
        this.logger.warn(
          `Attempt ${attempt}/${config.maxAttempts} failed in ${context}, retrying in ${delay}ms`,
          { error: lastError.message }
        );

        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Max retry attempts exceeded');
  }

  /**
   * Computes the delay (in ms) for the given attempt using exponential backoff
   * with an optional ±25% jitter and a maximum cap.
   *
   * @param attempt - 1-based attempt index.
   * @param config - Effective retry configuration.
   * @returns The delay in milliseconds, rounded down to an integer.
   *
   * @example
   * // With baseDelay=1000, exponentialBase=2:
   * // attempt 1 -> 1000ms, attempt 2 -> 2000ms, attempt 3 -> 4000ms ...
   */
  private static calculateDelay(attempt: number, config: RetryOptions): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);
    let delay = Math.min(exponentialDelay, config.maxDelay);

    if (config.jitter) {
      // Add jitter: ±25% of the calculated delay
      const jitterRange = delay * 0.25;
      const jitter = (Math.random() - 0.5) * 2 * jitterRange;
      delay = Math.max(0, delay + jitter);
    }

    return Math.floor(delay);
  }

  /**
   * Returns a promise that resolves after the specified number of milliseconds.
   *
   * @param ms - Milliseconds to wait.
   * @returns Promise that resolves after `ms`.
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executes an async operation with a hard timeout.
   *
   * @typeParam T - The resolved type of the operation.
   * @param operation - Function returning a promise for the work to execute.
   * @param timeoutMs - Maximum time in milliseconds before timing out.
   * @param context - Optional context string included in the timeout error message.
   * @returns A promise that resolves to the operation result, or rejects on timeout.
   * @throws `Error` if the operation does not complete within `timeoutMs`.
   *
   * @example
   * await RetryHelper.executeWithTimeout(fetchData, 3000, 'fetchData');
   */
  public static async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    context?: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms in ${context}`));
      }, timeoutMs);
    });

    return Promise.race([operation(), timeoutPromise]);
  }
}