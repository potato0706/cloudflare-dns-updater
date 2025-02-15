/** IPify API response structure */
declare type IPifyResponse = {
    /** Current public IPv4 address */
    readonly ip: string;
};

/** Cloudflare API error object */
type Errors = {
    /** HTTP response status code */
    readonly code: number;
    /** Error message */
    readonly message: string;
};

/** Cloudflare API result info object */
type ResultInfo = {
    /** Current page number */
    readonly page: number;
    /** Number of items per page */
    readonly per_page: number;
    /** Number of items on the current page */
    readonly count: number;
    /** Total number of items */
    readonly total_count: number;
    /** Total number of pages */
    readonly total_pages: number;
};

/** Cloudflare DNS record result */
type Result = {
    /** Record ID */
    readonly id: string;
    /** Zone ID */
    readonly zone_id: string;
    /** Zone name */
    readonly zone_name: string;
    /** Record name */
    readonly name: string;
    /** Record type */
    readonly type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'TXT';
    /** Record content */
    readonly content: string;
    /** Proxiable flag */
    readonly proxiable: boolean;
    /** Proxied flag */
    readonly proxied: boolean;
    /** Record priority */
    readonly ttl: number;
    /** Locked flag */
    readonly locked: boolean;
    /** Record meta */
    readonly meta: {
        /** Auto-added flag */
        readonly auto_added: boolean;
        /** Source */
        readonly source: string;
    };
    /** Record comment */
    readonly comment: string | null;
    /** Record tags */
    readonly tags: string[];
    /** Creation date */
    readonly created_on: string;
    /** Last modified date */
    readonly modified_on: string;
};

/** Cloudflare DNS API response structure */
declare interface CloudflareDNSResponse {
    /** Success flag */
    readonly success: boolean;
    /** Error objects */
    readonly errors: Errors[];
    /** Information messages */
    readonly messages: string[];
    /** Result info */
    readonly result_info?: ResultInfo;
    /** DNS record data objects */
    readonly result: Result[];
}
