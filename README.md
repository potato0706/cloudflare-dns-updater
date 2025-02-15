# Cloudflare DNS Updater [![Node.js](https://img.shields.io/badge/Bun-≥1.1.21-white)](https://bun.sh/) [![TypeScript](https://img.shields.io/badge/TypeScript-≥5-blue)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-orange)](LICENSE)

A robust solution for automatically updating Cloudflare DNS records with your current public IP address. Ideal for self-hosted services with dynamic IP addresses.

###### ⚠️ This is not an official Cloudflare project.

## 📝 Prerequisites

-   Bun 1.1.21 or later
-   Cloudflare account with:
    -   API key with `DNS:Edit` permission
    -   Zone ID for target domain
    -   Existing `A` record to update in the target domain
-   **(Optional)** Docker and Docker Compose / PM2 for deployment

## 🚀 Getting Started

1. Clone this repository:

    ```bash
    git clone https://github.com/potato0706/cloudflare-dns-updater.git
    cd cloudflare-dns-updater
    ```

2. Install dependencies:

    ```bash
    bun install
    ```

3. Create environment file:

    ```bash
    cp .env.example .env
    ```

4. Update `.env` with your Cloudflare credentials and desired configuration:

    | Variable          | Description                                         | Default |
    | ----------------- | --------------------------------------------------- | ------- |
    | `API_TOKEN`       | Cloudflare API token with DNS:Edit permission       |         |
    | `ZONE_ID`         | Cloudflare Zone ID for the target domain            |         |
    | `DOMAIN`          | Domain name to update DNS records for               |         |
    | `PROXIED`         | Whether Cloudflare proxied status should be enabled |         |
    | `MAX_RETRIES`     | Maximum retry attempts for API calls                | `3`     |
    | `RETRY_DELAY`     | Retry delay in seconds                              | `5`     |
    | `UPDATE_INTERVAL` | Update interval in seconds                          | `60`    |

## ⌨️ Usage

### Development Mode

```bash
bun .
```

### Production Deployment

#### With Docker Compose (Recommended)

```bash
docker compose up -d
```

#### With PM2

```bash
pm2 start ecosystem.config.js
```

## ©️ License Information

[Cloudflare DNS Updater](https://github.com/potato0706/cloudflare-dns-updater) © 2025 [Potato_Chips0706](https://potatochips0706.com) is licensed under [MIT License](LICENSE)
