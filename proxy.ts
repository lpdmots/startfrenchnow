import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);
const supportedLocales = new Set(routing.locales);

function buildCanonicalRedirect(request: NextRequest, normalizedPathname: string) {
    const url = new URL(request.url);
    url.pathname = normalizedPathname;
    return NextResponse.redirect(url, 308);
}

export default function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const localeSegmentMatch = pathname.match(/^\/([A-Za-z]{2})(\/.*)?$/);

    if (localeSegmentMatch) {
        const localeSegment = localeSegmentMatch[1].toLowerCase();
        const restPath = localeSegmentMatch[2] || "";

        if (localeSegment === routing.defaultLocale) {
            return buildCanonicalRedirect(request, restPath || "/");
        }

        if (!supportedLocales.has(localeSegment as (typeof routing.locales)[number])) {
            return buildCanonicalRedirect(request, restPath || "/");
        }
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: [
        "/((?!api|_next/static|robots\\.txt|sitemap\\.xml|_next/image|favicon.ico|images/|audio/|admin|studio|tarteaucitron|\\.well-known).*)",
    ],
};
