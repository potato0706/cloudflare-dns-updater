module.exports = {
    apps: [
        {
            name: 'cloudflare-dns-updater',
            script: './src/index.js',
            interpreter: 'bun',
            watch: false,
            log_date_format: '',
        },
    ],
};
