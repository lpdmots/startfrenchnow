const LEGACY_HOSTS = new Set(["startfrenchnow.com", "www.startfrenchnow.com"]);
const RETIRED_SLUGS = new Map([
    ["4-guide-pour-reussir-la-partie-lire-et-ecrire-du-test-fide", "4-le-test-fide-lire-et-ecrire"],
    ["5-comment-reussir-la-partie-orale-a2-de-le-test-fide", "5-le-test-fide-l-oral-a2-en-detail"],
]);

function localizePathname(pathname, locale) {
    const withoutFrenchPrefix = pathname === "/fr" ? "/" : pathname.replace(/^\/fr(?=\/)/, "");
    const localized = locale === "fr" ? (withoutFrenchPrefix === "/" ? "/fr" : `/fr${withoutFrenchPrefix}`) : withoutFrenchPrefix;
    return localized.replace(/\/blog\/post\/([^/]+)$/, (match, slug) => {
        const replacement = RETIRED_SLUGS.get(slug);
        return replacement ? match.replace(slug, replacement) : match;
    });
}

export function rewriteLegacyStartFrenchNowUrl(url, locale) {
    if (typeof url !== "string" || (locale !== "fr" && locale !== "en")) return url;

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return url;
    }

    if (!LEGACY_HOSTS.has(parsed.hostname.toLowerCase())) return url;

    parsed.protocol = "https:";
    parsed.hostname = "startfrenchnow.ch";
    parsed.port = "";
    parsed.pathname = localizePathname(parsed.pathname, locale);
    return parsed.toString();
}

export function rewritePortableTextLegacyLinks(value, locale) {
    const changes = [];

    function visit(current, path) {
        if (Array.isArray(current)) {
            return current.map((item, index) => visit(item, [...path, String(index)]));
        }

        if (!current || typeof current !== "object") return current;

        return Object.fromEntries(
            Object.entries(current).map(([key, child]) => {
                const childPath = [...path, key];
                if (key === "href" && typeof child === "string") {
                    const rewritten = rewriteLegacyStartFrenchNowUrl(child, locale);
                    if (rewritten !== child) {
                        changes.push({ path: childPath.join("."), from: child, to: rewritten });
                    }
                    return [key, rewritten];
                }
                return [key, visit(child, childPath)];
            }),
        );
    }

    return { value: visit(value, []), changes };
}
