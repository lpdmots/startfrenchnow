/** @type {import('next').NextConfig} */

const withNextIntl = require("next-intl/plugin")("./i18n.ts");

module.exports = withNextIntl({
    reactStrictMode: true,
    experimental: {
        appDir: true,
        serverActions: true,
    },
    images: {
        domains: ["encrypted-tbn0.gstatic.com", "cdn.sanity.io", "i-don-t-speak-french.s3.eu-central-1.amazonaws.com"],
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
                destination: "/en/:path*",
                permanent: true,
            },
            { source: "/es", destination: "/en", permanent: true },
            { source: "/pt", destination: "/en", permanent: true },
            { source: "/tr", destination: "/en", permanent: true }
        );

        return redirects;
    },
});
