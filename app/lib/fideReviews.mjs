/**
 * Keep explicitly featured reviews first, then preserve the existing newest-first order.
 * The source array is copied so every consumer can safely reuse sharedFideReviews.
 *
 * @template {{ featured?: boolean, date?: number }} T
 * @param {T[]} reviews
 * @returns {T[]}
 */
export function sortFideReviews(reviews) {
    return [...reviews].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (b.date ?? 0) - (a.date ?? 0));
}

/**
 * Resolve both repository-hosted result images and historical CloudFront keys.
 *
 * @param {string | undefined} certificat
 * @param {string} cloudFrontDomain
 * @returns {string | null}
 */
export function getFideReviewCertificateUrl(certificat, cloudFrontDomain) {
    if (!certificat) return null;
    if (certificat.startsWith("/") || certificat.startsWith("http://") || certificat.startsWith("https://")) return certificat;
    if (!cloudFrontDomain) return certificat;

    return `${cloudFrontDomain.replace(/\/$/, "")}/${certificat.replace(/^\//, "")}`;
}
