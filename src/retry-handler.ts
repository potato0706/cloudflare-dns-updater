import { Logger } from './logger';

/**
 * Executes a function with configurable retry logic.
 */
export class RetryHandler {
    /**
     * Creates a new RetryHandler instance.
     * @param maxRetries - Maximum number of retries.
     * @param retryDelay - Delay before retries in seconds.
     */
    constructor(private maxRetries: number, private retryDelay: number) {}

    /**
     * Executes a function with retries upon failure.
     * @param fn - The function to execute.
     * @returns A promise that resolves to the function's return value if successful.
     * @throws Will rethrow the last error if all retries fail.
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === this.maxRetries - 1) {
                    throw error;
                }
                const delay = this.retryDelay * 1000 * Math.pow(2, i);
                Logger.log(
                    `Retry ${i + 1}/${this.maxRetries} failed: ${
                        (error as Error).message
                    }. Waiting ${delay} seconds...`,
                    true
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error('All retries failed');
    }
}
