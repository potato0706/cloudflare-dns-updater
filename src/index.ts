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
    /** The IDs of the DNS records to update. */
    private recordIDs: string[] = [];

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
     * Retrieves and stores the DNS record IDs to be updated.
     */
    async initialize(): Promise<void> {
        this.recordIDs = await this.retryHandler.execute(() =>
            this.getRecordIDs()
        );
        Logger.log(`DNS record IDs retrieved: ${this.recordIDs.join(', ')}`);
    }

    /**
     * Fetches IDs for all A-type DNS records matching the configured domain.
     * @throws Will throw a [DNSRecordError](src/types/errors.d.ts) if no DNS records are found.
     */
    private async getRecordIDs(): Promise<string[]> {
        const data = await this.apiClient.getDNSRecords();
        const records = data.result.filter(
            (d: any) => d.name === this.config.DOMAIN && d.type === 'A'
        );
        if (!records.length) {
            throw new DNSRecordError('No DNS records found');
        }
        return records.map((r: any) => r.id);
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
     * Checks if the current public IP changed and updates the Cloudflare DNS records if necessary.
     */
    async checkAndUpdateIP(): Promise<void> {
        const newIP = await this.retryHandler.execute(() => this.getPublicIP());
        if (this.currentIP !== newIP) {
            await this.retryHandler.execute(async () => {
                await Promise.all(
                    this.recordIDs.map((id) =>
                        this.apiClient.updateDNSRecord(id, newIP)
                    )
                );
            });
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
