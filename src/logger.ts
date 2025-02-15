/**
 * Provides a simple logger that prepends a timestamp to each message.
 */
export class Logger {
    /**
     * Logs a message to the console with a timestamp.
     * @param message - The message to log.
     * @param isError - Whether to log the message as an error (defaults to false).
     */
    static log(message: string, isError: boolean = false): void {
        const timestamp = new Date().toISOString();
        const logger = isError ? console.error : console.log;
        logger(`[${timestamp}] ${message}`);
    }
}
