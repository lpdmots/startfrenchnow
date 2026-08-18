export function getExplicitLinkLocale(currentLocale, targetLocale) {
    return currentLocale === targetLocale ? undefined : targetLocale;
}
