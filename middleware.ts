import createMiddleware from "next-intl/middleware";

export default createMiddleware({
    // A list of all locales that are supported
    locales: ["en", "fr"],

    // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
    defaultLocale: "en",
    localeDetection: true,
});

export const config = {
    matcher: [
        "/((?!api|_next/static|robots\\.txt|sitemap\\.xml|_next/image|favicon.ico|images/|audio/|admin|studio|tarteaucitron|test(?:/|$)|\\.well-known).*)",
    ],
};
