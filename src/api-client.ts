import { Config } from './config';

/**
 * HTTP request error indicates a failure occurred making an HTTP request.
 */
export class HTTPError extends Error {
    /**
     * Creates an HTTPError.
     * @param status - HTTP status code.
     * @param message - The error message.
     */
    constructor(status: number, message: string) {
        super(`HTTP Error: ${message}`);
        this.name = 'HTTPError';
    }
}

/**
 * Represents an HTTP client for Cloudflare's DNS API.
 */
export class APIClient {
    /**
     * Additional headers used in requests to Cloudflare.
     */
    private readonly headers: HeadersInit;

    /**
     * Creates an instance of APIClient.
     * @param config - The configuration object from [Config](src/config.ts).
     */
    constructor(private config: Config) {
        this.headers = {
            Authorization: `Bearer ${config.API_TOKEN}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Validates and returns the JSON from Cloudflare's response.
     * @param response - The response from a fetch call.
     * @throws Will throw an [HTTPError](src/types/errors.d.ts) if the response is not ok or success is false.
     */
    private async handleResponse(
        response: Response
    ): Promise<CloudflareDNSResponse> {
        if (!response.ok) {
            throw new HTTPError(response.status, response.statusText);
        }
        const data: CloudflareDNSResponse = await response.json();
        if (!data.success) {
            throw new HTTPError(500, 'API request failed');
        }
        return data;
    }

    /**
     * Fetches the DNS records for the configured domain.
     * @returns A promise that resolves to the DNS records.
     */
    async getDNSRecords(): Promise<CloudflareDNSResponse> {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${this.config.ZONE_ID}/dns_records`,
            { headers: this.headers }
        );
        return this.handleResponse(response);
    }

    /**
     * Updates the DNS record with a new IP address.
     * @param recordID - The DNS record ID.
     * @param ip - The new IP address to update the record with.
     */
    async updateDNSRecord(recordID: string, ip: string): Promise<void> {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${this.config.ZONE_ID}/dns_records/${recordID}`,
            {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify({
                    type: 'A',
                    name: this.config.DOMAIN,
                    content: ip,
                    proxied: this.config.PROXIED,
                }),
            }
        );
        await this.handleResponse(response);
    }
}
