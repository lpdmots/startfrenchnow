import createMiddleware from "next-intl/middleware";

export default createMiddleware({
    // A list of all locales that are supported
    locales: ["en", "fr", "es", "pt", "tr"],

    // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
    defaultLocale: "en",
});

export const config = {
    // Skip all paths that should not be internationalized. This example skips the
    // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/|admin|studio).*)"],
};
