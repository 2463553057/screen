const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        typedRoutes: true,
        serverActions: {
            allowedOrigins: ["localhost:3000"]
        }
    }
};

module.exports = withNextIntl(nextConfig); 