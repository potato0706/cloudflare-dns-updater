/**
 * Configuration error indicates a missing or invalid config setting.
 */
class ConfigurationError extends Error {
    /**
     * Creates a ConfigurationError.
     * @param message - The error message.
     */
    constructor(message: string) {
        super(`Configuration Error: ${message}`);
        this.name = 'ConfigurationError';
    }
}

/**
 * Provides application configuration from environment variables.
 *
 * Throws a [ConfigurationError](src/types/errors.d.ts) if required variables are missing or invalid.
 */
export class Config {
    /** Cloudflare API token with DNS:Edit permission */
    readonly API_TOKEN: string;
    /** Cloudflare Zone ID for the target domain */
    readonly ZONE_ID: string;
    /** Domain name to update DNS records for */
    readonly DOMAIN: string;
    /** Whether Cloudflare proxied status should be enabled */
    readonly PROXIED: boolean;
    /** Maximum retry attempts for API calls */
    readonly MAX_RETRIES: number;
    /** Retry delay in seconds */
    readonly RETRY_DELAY: number;
    /** Update interval in seconds */
    readonly UPDATE_INTERVAL: number;

    /**
     * Creates a new Config instance and checks for required env variables.
     */
    constructor() {
        const requiredEnvVars = ['API_TOKEN', 'ZONE_ID', 'DOMAIN', 'PROXIED'];
        const missing = requiredEnvVars.filter(
            (varName) => !process.env[varName]
        );
        if (missing.length) {
            throw new ConfigurationError(
                `Missing required config: ${missing.join(', ')}`
            );
        }

        if (!process.env.PROXIED!.match(/^(true|false)$/)) {
            throw new ConfigurationError(
                `Invalid value for PROXIED=${process.env.PROXIED}. Must be either 'true' or 'false'`
            );
        }

        this.API_TOKEN = process.env.API_TOKEN!;
        this.ZONE_ID = process.env.ZONE_ID!;
        this.DOMAIN = process.env.DOMAIN!;
        this.PROXIED = process.env.PROXIED!.toLowerCase() === 'true';
        this.MAX_RETRIES = process.env.MAX_RETRIES
            ? Number(process.env.MAX_RETRIES)
            : 3;
        this.RETRY_DELAY = process.env.RETRY_DELAY
            ? Number(process.env.RETRY_DELAY)
            : 5000;
        this.UPDATE_INTERVAL = process.env.UPDATE_INTERVAL
            ? Number(process.env.UPDATE_INTERVAL)
            : 60;
    }
}
