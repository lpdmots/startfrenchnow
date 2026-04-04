import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
    matcher: [
        "/((?!api|_next/static|robots\\.txt|sitemap\\.xml|_next/image|favicon.ico|images/|audio/|admin|studio|tarteaucitron|\\.well-known).*)",
    ],
};
