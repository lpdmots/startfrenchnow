import type { MetadataRoute } from "next";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
    const privatePaths = ["/api/", "/admin/", "/studio/", "/maintenance/", "/account/", "/fide/dashboard/", "/checkout/", "/payment-success/", "/auth/", "/admin/comments/", "/my-free-video/"];

    // EN = sans préfixe, FR = /fr/...
    const disallow = [...privatePaths, ...privatePaths.map((p) => `/fr${p}`)];

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow,
            },
        ],
        sitemap: `${SITE}/sitemap.xml`,
        host: SITE,
    };
}
