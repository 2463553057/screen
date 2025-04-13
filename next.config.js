const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "*.vercel.app"]
        }
    },
    poweredByHeader: false,
    compress: true
};

module.exports = withNextIntl(nextConfig); 