import type { MetadataRoute } from "next";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://startfrenchnow.ch").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
    const privatePaths = [
        "/api/",
        "/admin/",
        "/studio/",
        "/maintenance/",
        "/account/",
        "/fide/dashboard/",
        "/checkout/",
        "/payment-success/",
        "/auth/",
        "/admin/comments/",
        "/my-free-video/",
        "/mock-exams/",
        "/exam/",
        "/rdv-success/",
        "/courses/dashboard/",
        "/stories/*",
    ];

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
