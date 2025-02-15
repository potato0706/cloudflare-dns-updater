import { APIClient } from './api-client';
import { Config } from './config';
import { RetryHandler } from './retry-handler';
import { Logger } from './logger';

/**
 * DNS record error indicates a failure occurred working with DNS records.
 */
export class DNSRecordError extends Error {
    /**
     * Creates a DNSRecordError.
     * @param message - The error message.
     */
    constructor(message: string) {
        super(`DNS Record Error: ${message}`);
        this.name = 'DNSRecordError';
    }
}

/**
 * Represents the core Cloudflare DNS updater.
 */
class CloudflareDNSUpdater {
    /** The current public IP address of the device. */
    private currentIP?: string;
    /** The ID of the DNS record to update. */
    private recordID?: string;

    /**
     * Creates an instance of CloudflareDNSUpdater.
     * @param apiClient - An [APIClient](src/api-client.ts) instance.
     * @param retryHandler - A [RetryHandler](src/retry-handler.ts) instance.
     * @param config - A [Config](src/config.ts) instance.
     */
    constructor(
        private apiClient: APIClient,
        private retryHandler: RetryHandler,
        private config: Config
    ) {}

    /**
     * Retrieves and stores the DNS record ID to be updated.
     */
    async initialize(): Promise<void> {
        this.recordID = await this.retryHandler.execute(() =>
            this.getRecordID()
        );
        Logger.log('DNS record ID retrieved successfully');
    }

    /**
     * Fetches the DNS record ID for the configured domain.
     * @throws Will throw a [DNSRecordError](src/types/errors.d.ts) if the DNS record is not found.
     */
    private async getRecordID(): Promise<string> {
        const data = await this.apiClient.getDNSRecords();
        const record = data.result.find(
            (d: any) => d.name === this.config.DOMAIN && d.type === 'A'
        );
        if (!record) {
            throw new DNSRecordError('DNS record not found');
        }
        return record.id;
    }

    /**
     * Retrieves the current public IP address of the device using ipify.
     * @returns A promise that resolves to the public IP address.
     */
    private async getPublicIP(): Promise<string> {
        const response = await fetch('https://api.ipify.org?format=json');
        const data: IPifyResponse = await response.json();
        return data.ip;
    }

    /**
     * Checks if the current public IP changed and updates the Cloudflare DNS record if necessary.
     */
    async checkAndUpdateIP(): Promise<void> {
        const newIP = await this.retryHandler.execute(() => this.getPublicIP());

        if (this.currentIP !== newIP) {
            await this.retryHandler.execute(() =>
                this.apiClient.updateDNSRecord(this.recordID!, newIP)
            );
            Logger.log(
                `IP updated from ${this.currentIP || 'undefined'} → ${newIP}`
            );
            this.currentIP = newIP;
        } else {
            Logger.log('IP unchanged');
        }
    }

    /**
     * Starts the updater by periodically checking and updating the IP address.
     */
    start(): void {
        const update = async () => {
            try {
                await this.checkAndUpdateIP();
            } catch (error) {
                Logger.log(`Update failed: ${(error as Error).message}`, true);
            }
            setTimeout(update, this.config.UPDATE_INTERVAL * 1000);
        };
        update();
    }
}

(async () => {
    const config = new Config();
    const apiClient = new APIClient(config);
    const retryHandler = new RetryHandler(
        config.MAX_RETRIES,
        config.RETRY_DELAY
    );
    const updater = new CloudflareDNSUpdater(apiClient, retryHandler, config);

    await updater.initialize();
    updater.start();
})();
