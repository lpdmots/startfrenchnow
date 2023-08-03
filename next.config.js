/** @type {import('next').NextConfig} */
const nextConfig = {
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
