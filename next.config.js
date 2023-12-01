/** @type {import('next').NextConfig} */
/* const nextConfig = {
    reactStrictMode: true,
    experimental: {
        appDir: true,
        serverActions: true,
    },
    images: {
        domains: ["encrypted-tbn0.gstatic.com", "cdn.sanity.io", "i-don-t-speak-french.s3.eu-central-1.amazonaws.com"],
    },
    redirects() {
        return [process.env.MAINTENANCE_MODE === "1" ? { source: "/((?!maintenance).*)", destination: "/maintenance", permanent: false } : null].filter(Boolean);
    },
};

module.exports = nextConfig;
 */
const withNextIntl = require("next-intl/plugin")(
    // This is the default (also the `src` folder is supported out of the box)
    "./i18n.ts"
);

module.exports = withNextIntl({
    reactStrictMode: true,
    experimental: {
        appDir: true,
        serverActions: true,
    },
    images: {
        domains: ["encrypted-tbn0.gstatic.com", "cdn.sanity.io", "i-don-t-speak-french.s3.eu-central-1.amazonaws.com"],
    },
    redirects() {
        return [
            // Redirection pour les chemins /blog avec une locale spécifiée
            process.env.MAINTENANCE_MODE === "1"
                ? {
                      source: "/:locale/blog/:path*",
                      destination: "/maintenance",
                      permanent: false,
                      locale: false, // Ne pas préfixer automatiquement avec la locale par défaut
                  }
                : null,
            // Redirection pour les chemins /blog sans locale
            process.env.MAINTENANCE_MODE === "1"
                ? {
                      source: "/blog/:path*",
                      destination: "/maintenance",
                      permanent: false,
                  }
                : null,
        ].filter(Boolean);
    },
});
