/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});
const withNextIntl = require("next-intl/plugin")("./i18n.ts");

module.exports = withBundleAnalyzer(
    withNextIntl({
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
            { protocol: "https", hostname: "cdn.sanity.io" },
            { protocol: "https", hostname: "i-don-t-speak-french.s3.eu-central-1.amazonaws.com" },
        ],
    },
    async redirects() {
        const redirects = [];

        // ----- Maintenance mode -----
        if (process.env.MAINTENANCE_MODE === "1") {
            // Blog avec locale
            redirects.push({
                source: "/:locale/blog/:path*",
                destination: "/maintenance",
                permanent: false,
                locale: false, // Empêche le préfixe automatique
            });
            // Blog sans locale
            redirects.push({
                source: "/blog/:path*",
                destination: "/maintenance",
                permanent: false,
            });
        }

        // ----- Redirections locales supprimées → EN -----
        redirects.push(
            {
                source: "/:locale(es|pt|tr)/:path*",
                destination: "/:path*",
                permanent: true,
                locale: false,
            },
            { source: "/es", destination: "/", permanent: true },
            { source: "/pt", destination: "/", permanent: true },
            { source: "/tr", destination: "/", permanent: true }
        );

        return redirects;
    },
    })
);
