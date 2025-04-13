import type { Configuration } from 'webpack';
import withNextIntl from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        typedRoutes: true,
        serverActions: {
            allowedOrigins: ["localhost:3000"]
        }
    },
    webpack: (config: Configuration) => {
        return config;
    }
};

export default withNextIntl('./i18n.ts')(nextConfig);
